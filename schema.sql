-- Cardinal Resource Hub relational reference for Neon/PostgreSQL.
create table app_user (
  user_id integer generated always as identity primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('organization', 'faculty', 'maintenance', 'admin')),
  contact_number text
);

create table student_organization (
  org_id integer generated always as identity primary key,
  org_name text not null unique,
  faculty_adviser_id integer references app_user(user_id),
  contact_email text not null,
  status text not null default 'Active' check (status in ('Active', 'Pending', 'Inactive'))
);

create table room (
  room_id integer generated always as identity primary key,
  room_name text not null,
  location text not null,
  capacity integer not null check (capacity > 0),
  availability_status text not null default 'Available'
);

create table equipment (
  equipment_id integer generated always as identity primary key,
  equipment_name text not null,
  category text not null,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  status text not null default 'Available'
);

create table booking (
  booking_id integer generated always as identity primary key,
  org_id integer not null references student_organization(org_id),
  room_id integer not null references room(room_id),
  requested_by_user_id integer not null references app_user(user_id),
  date_requested timestamptz not null default now(),
  event_date date not null,
  start_time time not null,
  end_time time not null,
  purpose text not null,
  status text not null check (status in ('Faculty review', 'Maintenance review', 'Admin review', 'Approved', 'Prepared', 'Rejected'))
);

create table booking_equipment (
  booking_id integer not null references booking(booking_id) on delete cascade,
  equipment_id integer not null references equipment(equipment_id),
  quantity_requested integer not null check (quantity_requested > 0),
  primary key (booking_id, equipment_id)
);

create table document (
  document_id integer generated always as identity primary key,
  booking_id integer not null references booking(booking_id) on delete cascade,
  file_name text not null,
  file_path text not null,
  upload_date timestamptz not null default now(),
  signature_status text
);

create table approval (
  approval_id integer generated always as identity primary key,
  booking_id integer not null references booking(booking_id) on delete cascade,
  approved_user_id integer not null references app_user(user_id),
  approval_level integer not null check (approval_level in (1, 2, 3)),
  status text not null check (status in ('Approved', 'Rejected', 'Pending')),
  date_actioned timestamptz,
  remarks text
);
