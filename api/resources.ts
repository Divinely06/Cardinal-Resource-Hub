import type { Request, Response } from "express";
import { sql } from "./_db.js";

export default async function handler(_request: Request, response: Response) {
  if (_request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const [rooms, equipment, organizations] = await Promise.all([
      sql`
        select room_id, room_name, location, capacity, availability_status
        from room order by room_name
      `,
      sql`
        select equipment_id, equipment_name, category, quantity_available, status
        from equipment order by equipment_name
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
