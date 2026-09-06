import type { Request, Response } from "express";
import { sql } from "./_db.js";

async function listBookings(response: Response) {
  const bookings = await sql`
    select b.booking_id, b.org_id, o.org_name, b.room_id, r.room_name,
      b.requested_by_user_id, b.event_name, b.participant_count,
      b.date_requested, b.event_date, b.start_time, b.end_time,
      b.purpose, b.rejection_reason, b.status
    from booking b
    join student_organization o on o.org_id = b.org_id
    join room r on r.room_id = b.room_id
    order by b.date_requested desc
  `;
  response.json(bookings);
}

export default async function handler(request: Request, response: Response) {
  try {
    if (request.method === "GET") {
      await listBookings(response);
      return;
    }

    if (request.method === "POST") {
      const {
        orgId,
        roomId,
        requestedByUserId,
        eventName,
        participantCount,
        eventDate,
        startTime,
        endTime,
        purpose,
      } = request.body ?? {};
      const [requester] = requestedByUserId
        ? [{ user_id: requestedByUserId }]
        : await sql`
            select u.user_id from app_user u
            join student_organization o on o.contact_email = u.email
            where o.org_id = ${orgId} and u.role = 'organization' limit 1
          `;
      if (!orgId || !roomId || !requester?.user_id || !eventName || !participantCount || !eventDate || !startTime || !endTime || !purpose) {
        response.status(400).json({ error: "Missing required booking fields" });
        return;
      }
      await sql`
        insert into booking (
          org_id, room_id, requested_by_user_id, event_name, participant_count,
          event_date, start_time, end_time, purpose
        ) values (
          ${orgId}, ${roomId}, ${requester.user_id}, ${eventName}, ${participantCount},
          ${eventDate}, ${startTime}, ${endTime}, ${purpose}
        )
      `;
      response.status(201).json({ created: true });
      return;
    }

    if (request.method === "PATCH") {
      const bookingId = Number(request.query.id);
      const { status, userId, remarks } = request.body ?? {};
      if (!Number.isInteger(bookingId) || !status || !userId) {
        response.status(400).json({ error: "Invalid status update" });
        return;
      }
      const levels: Record<string, number> = {
        "Maintenance review": 1,
        "Admin review": 2,
        "Dean review": 3,
        Approved: 4,
        Rejected: 4,
      };
      await sql`
        update booking set status = ${status} where booking_id = ${bookingId}
      `;
      if (levels[status]) {
        await sql`
          insert into approval (booking_id, approved_user_id, approval_level, status, date_actioned, remarks)
          values (${bookingId}, ${userId}, ${levels[status]}, ${status === "Rejected" ? "Rejected" : "Approved"}, now(), ${remarks ?? null})
          on conflict (booking_id, approval_level) do update set
            approved_user_id = excluded.approved_user_id,
            status = excluded.status,
            date_actioned = excluded.date_actioned,
            remarks = excluded.remarks
        `;
      }
      response.json({ updated: true });
      return;
    }

    response.status(405).json({ error: "Method not allowed" });
  } catch {
    response.status(409).json({ error: "Database operation failed" });
  }
}
