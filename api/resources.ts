import type { Request, Response } from "express";
import { sql } from "./_db.js";

export default async function handler(_request: Request, response: Response) {
  if (_request.method === "POST") {
    const { type, name, location, capacity, category, quantityAvailable } = _request.body ?? {};
    if (!["room", "equipment"].includes(type) || typeof name !== "string" || !name.trim()) {
      response.status(400).json({ error: "Resource type and name are required" });
      return;
    }
    try {
      if (type === "room") {
        const [room] = await sql`
          insert into room (room_name, location, capacity, availability_status)
          values (${name.trim()}, ${String(location ?? "To be assigned")}, ${Number(capacity) > 0 ? Number(capacity) : 1}, 'Available')
          returning room_id, room_name, location, capacity, availability_status
        `;
        response.status(201).json(room);
        return;
      }
      const [item] = await sql`
        insert into equipment (equipment_name, category, quantity_available, status)
        values (${name.trim()}, ${String(category ?? "General")}, ${Math.max(0, Number(quantityAvailable) || 0)}, 'Available')
        returning equipment_id, equipment_name, category, quantity_available, status
      `;
      response.status(201).json(item);
    } catch {
      response.status(409).json({ error: "Unable to add resource. The name may already exist." });
    }
    return;
  }
  if (_request.method === "PATCH") {
    const { type, id, name, location, capacity, availabilityStatus, quantityAvailable, status, category } = _request.body ?? {};
    if (!Number.isInteger(Number(id)) || !["room", "equipment"].includes(type)) {
      response.status(400).json({ error: "A valid resource type and ID are required" });
      return;
    }
    try {
      if (type === "room") {
        const [room] = await sql`
          update room
          set room_name = coalesce(${name ?? null}, room_name),
              location = coalesce(${location ?? null}, location),
              capacity = coalesce(${capacity ? Number(capacity) : null}, capacity),
              availability_status = coalesce(${availabilityStatus ?? null}, availability_status)
          where room_id = ${Number(id)}
          returning room_id, room_name, location, capacity, availability_status
        `;
        if (!room) {
          response.status(404).json({ error: "Facility not found" });
          return;
        }
        response.json(room);
        return;
      }
      const [item] = await sql`
        update equipment
        set equipment_name = coalesce(${name ?? null}, equipment_name),
            category = coalesce(${category ?? null}, category),
            quantity_available = coalesce(${quantityAvailable === undefined ? null : Number(quantityAvailable)}, quantity_available),
            status = coalesce(${status ?? null}, status)
        where equipment_id = ${Number(id)}
        returning equipment_id, equipment_name, category, quantity_available, status
      `;
      if (!item) {
        response.status(404).json({ error: "Equipment not found" });
        return;
      }
      response.json(item);
    } catch {
      response.status(409).json({ error: "Unable to update resource" });
    }
    return;
  }
  if (_request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const requestedDate = typeof _request.query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(_request.query.date)
      ? _request.query.date
      : null;
    const startTime = typeof _request.query.startTime === "string" && /^\d{2}:\d{2}$/.test(_request.query.startTime)
      ? _request.query.startTime
      : "00:00";
    const endTime = typeof _request.query.endTime === "string" && /^\d{2}:\d{2}$/.test(_request.query.endTime)
      ? _request.query.endTime
      : "23:59";
    const [rooms, equipment, organizations] = await Promise.all([
      sql`
        select r.room_id, r.room_name, r.location, r.capacity, r.availability_status,
          ${requestedDate ? sql`r.availability_status = 'Available' and not exists (
            select 1 from booking b
            where b.room_id = r.room_id
              and b.event_date = ${requestedDate}::date
              and b.status <> 'Rejected'
              and (${requestedDate}::date + ${startTime}::time, ${requestedDate}::date + ${endTime}::time)
                overlaps (b.event_date + b.start_time, b.event_date + b.end_time)
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
              and (${requestedDate ?? "9999-12-31"}::date + ${startTime}::time, ${requestedDate ?? "9999-12-31"}::date + ${endTime}::time)
                overlaps (b.event_date + b.start_time, b.event_date + b.end_time)
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
