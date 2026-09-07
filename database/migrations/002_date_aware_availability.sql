-- Prevent two non-rejected requests from reserving the same room and time.
-- Rejected requests release the room for a new request.

alter table booking
  drop constraint if exists no_overlapping_room_bookings;

alter table booking
  add constraint no_overlapping_room_bookings
  exclude using gist (
    room_id with =,
    tsrange(event_date + start_time, event_date + end_time, '[)') with &&
  )
  where (status <> 'Rejected');
