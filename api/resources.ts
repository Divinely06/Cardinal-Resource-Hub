import type { Request, Response } from "express";
import { sql } from "./_db.js";

export default async function handler(_request: Request, response: Response) {
  if (_request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const requestedDate = typeof _request.query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(_request.query.date)
      ? _request.query.date
      : null;
    const [rooms, equipment, organizations] = await Promise.all([
      sql`
        select r.room_id, r.room_name, r.location, r.capacity, r.availability_status,
          ${requestedDate ? sql`not exists (
            select 1 from booking b
            where b.room_id = r.room_id
              and b.event_date = ${requestedDate}::date
              and b.status <> 'Rejected'
          )` : sql`true`} as date_available
        from room r order by r.room_name
      `,
      sql`
        select e.equipment_id, e.equipment_name, e.category, e.quantity_available, e.status,
          greatest(0, e.quantity_available - coalesce((
            select sum(be.quantity_requested)
            from booking_equipment be
            join booking b on b.booking_id = be.booking_id
            where be.equipment_id = e.equipment_id
              and b.event_date = ${requestedDate ?? "9999-12-31"}::date
              and b.status <> 'Rejected'
          ), 0)) as date_available
        from equipment e order by e.equipment_name
      `,
      sql`
        select o.org_id, o.org_name, o.contact_email, o.status,
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
}
