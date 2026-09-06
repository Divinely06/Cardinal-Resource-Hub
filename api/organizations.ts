import { neon } from "@neondatabase/serverless";
import type { Request, Response } from "express";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(request: Request, response: Response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, email, password, facultyAdviser } = request.body ?? {};

  if (!name || !email || !password) {
    response.status(400).json({
      error: "Organization name, email, and password are required",
    });
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
      values (${name}, ${adviser?.user_id ?? null}, ${email}, 'Active')
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
}
