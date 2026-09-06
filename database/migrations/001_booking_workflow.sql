-- Apply once to existing Neon databases. The schema.sql contains these fields for fresh installs.

alter table booking
  add column if not exists client_request_id text;

update booking
set client_request_id = 'legacy-' || booking_id
where client_request_id is null;

alter table booking
  alter column client_request_id set not null;

create unique index if not exists booking_client_request_id_key
  on booking (client_request_id);

alter table document
  add column if not exists content_type text;

update document
set content_type = 'application/octet-stream'
where content_type is null;

alter table document
  alter column content_type set default 'application/octet-stream';

alter table document
  alter column content_type set not null;
