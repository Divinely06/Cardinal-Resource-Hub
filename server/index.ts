import express from "express";
import { sql } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use((_request, response, next) => {
  response.header("Access-Control-Allow-Origin", "http://localhost:5173");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/health", async (_request, response) => {
  try {
    await sql`select 1 as connected`;
    response.json({ database: "connected" });
  } catch {
    response.status(500).json({ database: "unavailable" });
  }
});

app.post("/api/auth", async (request, response) => {
  const { email, password } = request.body ?? {};
  if (!email || !password) {
    response.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const [user] = await sql`
      select u.user_id, u.full_name, u.email, u.role, o.org_id, o.org_name,
        (u.password_hash = crypt(${password}, u.password_hash)) as password_matches
      from app_user u
      left join user_organization membership on membership.user_id = u.user_id
        and membership.status = 'Active'
      left join student_organization o on o.org_id = membership.org_id
      where lower(u.email) = lower(${email})
      limit 1
    `;
    if (!user || !user.password_matches) {
      response.status(401).json({ error: "Invalid email or password" });
      return;
    }
    if (user.role === "organization" && !user.org_id) {
      response.status(409).json({
        error: "This organization account is not linked to an organization yet",
      });
      return;
    }
    response.json({
      userId: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      organizationId: user.org_id ?? null,
      organizationName: user.org_name ?? null,
    });
  } catch {
    response.status(500).json({ error: "Unable to sign in" });
  }
});

app.get("/api/bookings", async (request, response) => {
  try {
    const userId = Number(request.query.userId);
    const role = String(request.query.role ?? "");
    if (role === "faculty" && !userId) {
      response.status(401).json({ error: "Faculty identity is required" });
      return;
    }
    const bookings = await sql`
      select
        b.booking_id,
        b.org_id,
        o.org_name,
        b.room_id,
        r.room_name,
        b.requested_by_user_id,
        b.event_name,
        b.participant_count,
        b.date_requested,
        b.event_date,
        b.start_time,
        b.end_time,
        b.purpose,
        b.rejection_reason,
        b.status,
        coalesce((select json_agg(json_build_object(
          'name', d.file_name, 'type', d.content_type, 'data', d.file_path
        )) from document d where d.booking_id = b.booking_id), '[]'::json) as documents
      from booking b
      join student_organization o on o.org_id = b.org_id
      join room r on r.room_id = b.room_id
      where (${role} <> 'faculty' or o.faculty_adviser_id = ${userId || 0})
      order by b.date_requested desc
    `;
    response.json(bookings);
  } catch {
    response.status(500).json({ error: "Unable to load bookings" });
  }
});

app.get("/api/resources", async (_request, response) => {
  try {
    const [rooms, equipment, organizations] = await Promise.all([
      sql`
        select room_id, room_name, location, capacity, availability_status
        from room
        order by room_name
      `,
      sql`
        select equipment_id, equipment_name, category, quantity_available, status
        from equipment
        order by equipment_name
      `,
      sql`
        select
          o.org_id,
          o.org_name,
          o.contact_email,
          o.status,
          adviser.full_name as faculty_adviser
        from student_organization o
        left join app_user adviser on adviser.user_id = o.faculty_adviser_id
        order by o.org_name
      `,
    ]);

    response.json({ rooms, equipment, organizations });
  } catch {
    response.status(500).json({ error: "Unable to load resources" });
  }
});

app.post("/api/organizations", async (request, response) => {
  const { name, email, password, facultyAdviser } = request.body;

  if (!name || !email || !password) {
    response.status(400).json({ error: "Organization name, email, and password are required" });
    return;
  }

  try {
    const [adviser] = await sql`
      select user_id
      from app_user
      where full_name = ${facultyAdviser ?? "Prof. Maria Santos"}
        and role = 'faculty'
      limit 1
    `;
    const [user] = await sql`
      insert into app_user (full_name, email, password_hash, role)
      values (${name}, ${email}, crypt(${password}, gen_salt('bf')), 'organization')
      returning user_id
    `;
    const [organization] = await sql`
      insert into student_organization (
        org_name, faculty_adviser_id, contact_email, status
      )
      values (
        ${name}, ${adviser?.user_id ?? null}, ${email}, 'Active'
      )
      returning org_id, org_name, contact_email, status
    `;
    await sql`
      insert into user_organization (user_id, org_id, membership_role)
      values (${user.user_id}, ${organization.org_id}, 'Requester')
    `;
    response.status(201).json(organization);
  } catch {
    response.status(409).json({ error: "Unable to create organization account" });
  }
});

app.post("/api/bookings", async (request, response) => {
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
    clientRequestId,
    attachment,
  } = request.body;

  if (!clientRequestId) {
    response.status(400).json({ error: "Booking request ID is required" });
    return;
  }
  if (attachment?.data && attachment.data.length > 14 * 1024 * 1024) {
    response.status(413).json({ error: "Attached files must be 10 MB or smaller" });
    return;
  }
  const [existing] = await sql`
    select booking_id from booking where client_request_id = ${clientRequestId}
  `;
  if (existing) {
    response.status(200).json({ created: false, bookingId: existing.booking_id });
    return;
  }

  const requester = requestedByUserId
    ? [{ user_id: requestedByUserId }]
    : await sql`
        select u.user_id
        from app_user u
        join student_organization o on o.contact_email = u.email
        where o.org_id = ${orgId} and u.role = 'organization'
        limit 1
      `;
  const resolvedRequesterId = requester[0]?.user_id;

  if (
    !orgId ||
    !roomId ||
    !resolvedRequesterId ||
    !eventName ||
    !participantCount ||
    !eventDate ||
    !startTime ||
    !endTime ||
    !purpose
  ) {
    response.status(400).json({ error: "Missing required booking fields" });
    return;
  }

  try {
    const [booking] = await sql`
      insert into booking (
        org_id,
        room_id,
        requested_by_user_id,
        event_name,
        participant_count,
        event_date,
        start_time,
        end_time,
        purpose,
        client_request_id
      )
      values (
        ${orgId},
        ${roomId},
        ${resolvedRequesterId},
        ${eventName},
        ${participantCount},
        ${eventDate},
        ${startTime},
        ${endTime},
        ${purpose},
        ${clientRequestId}
      )
      returning booking_id
    `;

    if (attachment?.data && attachment.name) {
      await sql`
        insert into document (booking_id, file_name, file_path, content_type)
        values (${booking.booking_id}, ${attachment.name}, ${attachment.data}, ${attachment.type ?? "application/octet-stream"})
      `;
    }

    response.status(201).json(booking);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking failed";
    response.status(409).json({ error: message });
  }
});

app.patch("/api/bookings/:id/status", async (request, response) => {
  const bookingId = Number(request.params.id);
  const { status, userId, remarks } = request.body;

  if (!Number.isInteger(bookingId) || !status || !userId) {
    response.status(400).json({ error: "Invalid status update" });
    return;
  }

  const nextLevel: Record<string, number> = {
    "Faculty review": 1,
    "Maintenance review": 2,
    "Admin review": 3,
    "Dean review": 4,
  };

  try {
    const [booking] = await sql`
      update booking
      set status = ${status}
      where booking_id = ${bookingId}
      returning booking_id, status
    `;

    if (!booking) {
      response.status(404).json({ error: "Booking not found" });
      return;
    }

    if (nextLevel[status]) {
      await sql`
        insert into approval (
          booking_id, approved_user_id, approval_level, status, date_actioned, remarks
        )
        values (
          ${bookingId}, ${userId}, ${nextLevel[status]}, 'Approved', now(), ${remarks ?? null}
        )
        on conflict (booking_id, approval_level)
        do update set
          approved_user_id = excluded.approved_user_id,
          status = excluded.status,
          date_actioned = excluded.date_actioned,
          remarks = excluded.remarks
      `;
    }

    response.json(booking);
  } catch {
    response.status(409).json({ error: "Unable to update booking status" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${port}`);
});
