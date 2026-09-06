import { FormEvent, useEffect, useState } from "react";

const apiBase = import.meta.env.DEV ? "http://localhost:3001" : "";

type Role = "organization" | "faculty" | "admin" | "maintenance" | "dean";
type Status =
  | "Faculty review"
  | "Maintenance review"
  | "Admin review"
  | "Dean review"
  | "Approved"
  | "Prepared"
  | "Rejected";
type Page =
  | "dashboard"
  | "facilities"
  | "equipment"
  | "requests"
  | "bookings"
  | "history"
  | "management"
  | "organizations"
  | "profile";
type Organization = {
  id: number;
  name: string;
  email: string;
  password: string;
  facultyAdviser: string;
  status: "Active" | "Pending" | "Inactive";
};
type Booking = {
  id: string;
  event: string;
  orgId: number;
  org: string;
  venue: string;
  date: string;
  time: string;
  people: number;
  status: Status;
  equipment: string[];
  purpose: string;
  requestedByUserId: number;
  roomId: number;
  eventDate?: string;
};

function mapBooking(row: Record<string, string | number>): Booking {
  return {
    id: String(row.booking_id),
    event: String(row.event_name),
    orgId: Number(row.org_id),
    org: String(row.org_name),
    venue: String(row.room_name),
    date: new Date(`${row.event_date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: `${String(row.start_time).slice(0, 5)} – ${String(row.end_time).slice(0, 5)}`,
    people: Number(row.participant_count),
    status: String(row.status) as Status,
    equipment: [],
    purpose: String(row.purpose),
    requestedByUserId: Number(row.requested_by_user_id),
    roomId: Number(row.room_id),
    eventDate: String(row.event_date).slice(0, 10),
  };
}

const facilities = [
  {
    name: "Multi-Purpose Hall",
    type: "Event hall",
    location: "Building A · Ground Floor",
    capacity: 200,
    status: "Available",
    detail: "A flexible hall for assemblies, summits, and large campus events.",
  },
  {
    name: "Function Room 1",
    type: "Meeting room",
    location: "Building B · 2nd Floor",
    capacity: 50,
    status: "Available",
    detail:
      "A comfortable room for workshops, consultations, and organization meetings.",
  },
  {
    name: "Audio-Visual Room",
    type: "AV room",
    location: "Building C · 3rd Floor",
    capacity: 80,
    status: "Available",
    detail:
      "Integrated projector, sound system, and stage lighting for presentations.",
  },
  {
    name: "Open Court",
    type: "Outdoor",
    location: "Campus Grounds",
    capacity: 300,
    status: "Unavailable",
    detail: "Outdoor court currently reserved for campus athletics.",
  },
];
const equipment = [
  {
    name: "Wireless Microphone",
    category: "Audio",
    available: 8,
    total: 10,
    condition: "Good",
  },
  {
    name: "LCD Projector",
    category: "Audiovisual",
    available: 4,
    total: 6,
    condition: "Good",
  },
  {
    name: "Folding Tables",
    category: "Furniture",
    available: 35,
    total: 40,
    condition: "Good",
  },
  {
    name: "Monobloc Chairs",
    category: "Furniture",
    available: 150,
    total: 200,
    condition: "Fair",
  },
  {
    name: "LED Spotlight",
    category: "Lighting",
    available: 2,
    total: 8,
    condition: "Good",
  },
  {
    name: "Speaker Set",
    category: "Audio",
    available: 0,
    total: 4,
    condition: "Good",
  },
];
const initialOrganizations: Organization[] = [
  {
    id: 1,
    name: "Supreme Student Council",
    email: "ssc@mapua.edu.ph",
    password: "demo",
    facultyAdviser: "Prof. Maria Santos",
    status: "Active",
  },
  {
    id: 2,
    name: "IT Students Society",
    email: "itss@mapua.edu.ph",
    password: "demo",
    facultyAdviser: "Prof. Maria Santos",
    status: "Active",
  },
  {
    id: 3,
    name: "Business Enthusiasts Club",
    email: "bec@mapua.edu.ph",
    password: "demo",
    facultyAdviser: "Prof. Jose Reyes",
    status: "Active",
  },
];
const initialBookings: Booking[] = [
  {
    id: "BR-2026-001",
    event: "Leadership Summit 2026",
    orgId: 1,
    org: "Supreme Student Council",
    venue: "Multi-Purpose Hall",
    date: "Sep 20, 2026",
    time: "8:00 AM – 5:00 PM",
    people: 150,
    status: "Dean review",
    equipment: ["Wireless Microphone × 4", "LCD Projector × 2"],
    purpose: "Annual leadership training and summit for organization officers.",
    requestedByUserId: 101,
    roomId: 1,
  },
  {
    id: "BR-2026-002",
    event: "Tech Talk Series: AI in Industry",
    orgId: 2,
    org: "IT Students Society",
    venue: "Audio-Visual Room",
    date: "Sep 25, 2026",
    time: "1:00 PM – 5:00 PM",
    people: 60,
    status: "Faculty review",
    equipment: ["Wireless Microphone × 2", "LCD Projector × 1"],
    purpose:
      "Speaker series featuring industry professionals in AI and technology.",
    requestedByUserId: 102,
    roomId: 3,
  },
  {
    id: "BR-2026-003",
    event: "Entrepreneurship Fair 2026",
    orgId: 3,
    org: "Business Enthusiasts Club",
    venue: "Multi-Purpose Hall",
    date: "Oct 05, 2026",
    time: "9:00 AM – 4:00 PM",
    people: 200,
    status: "Prepared",
    equipment: ["Folding Tables × 30", "Monobloc Chairs × 100"],
    purpose: "Annual fair showcasing student business projects.",
    requestedByUserId: 103,
    roomId: 1,
  },
];
const roleInfo: Record<
  Role,
  { name: string; label: string; initials: string }
> = {
  organization: {
    name: "Supreme Student Council",
    label: "Organization requester",
    initials: "SS",
  },
  faculty: {
    name: "Prof. Maria Santos",
    label: "Faculty reviewer",
    initials: "MS",
  },
  admin: { name: "Administrator", label: "Administrator", initials: "AD" },
  maintenance: {
    name: "Alex Dela Cruz",
    label: "Maintenance handler",
    initials: "AD",
  },
  dean: {
    name: "Dean Villanueva",
    label: "Dean / final authority",
    initials: "DV",
  },
};

function Logo({ dark = false, showName = true }: { dark?: boolean; showName?: boolean }) {
  return (
    <div className={`brand ${dark ? "brand-dark" : ""}`}>
      <img
        className="mapua-logo"
        src="/mapua-logo.png"
        alt="Mapua University"
      />
      {showName && (
        <span>
          <b>Cardinal</b>
          <small>RESOURCE HUB</small>
        </span>
      )}
    </div>
  );
}
function Icon({ children }: { children: string }) {
  return (
    <span className="nav-icon" aria-hidden="true">
      {children}
    </span>
  );
}
function Button({
  children,
  onClick,
  secondary = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button ${secondary ? "button-secondary" : ""}`}
    >
      {children}
    </button>
  );
}
function Status({ value }: { value: Status | string }) {
  return (
    <span
      className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}
    >
      {value}
    </span>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
function Auth({
  organizations,
  onLogin,
}: {
  organizations: Organization[];
  onLogin: (role: Role, organizationId?: number) => void;
}) {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      setMode("reset");
      setMessage("A secure reset link has been sent to your Mapúa email.");
      return;
    }
    if (mode === "reset") {
      setMode("login");
      setMessage("Password updated. You can now sign in.");
      return;
    }
    if (password.length < 4) {
      setMessage("Enter your password to continue.");
      return;
    }
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        onLogin(result.role as Role, result.organizationId ?? undefined);
        return;
      }
      if (response.status !== 503) {
        setMessage(result.error ?? "Use an active Mapúa account.");
        return;
      }
    } catch {}

    const organization = organizations.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password,
    );
    const staffRole = ["faculty", "admin", "maintenance", "dean"].find(
      (role) => `${role}@mapua.edu.ph` === email.trim().toLowerCase(),
    ) as Role | undefined;
    if (staffRole && password === "demo") onLogin(staffRole);
    else if (organization) onLogin("organization", organization.id);
    else setMessage("Use an active Mapúa account to continue.");
  };
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div>
          <Logo dark showName={false} />
          <p className="eyebrow">MAPÚA UNIVERSITY · MAKATI CAMPUS</p>
          <h1>
            Reserve the spaces
            <br />
            where ideas happen.
          </h1>
          <p className="auth-copy">
            A single place for organizations, faculty, maintenance, and
            administrators to move every event forward.
          </p>
        </div>
        <div className="auth-note">
          <span>RESOURCE OPERATIONS</span>
          <strong>Facilities and equipment, in sync.</strong>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-inner">
          <span className="eyebrow">
            {mode === "login" ? "WELCOME BACK" : "ACCOUNT ACCESS"}
          </span>
          <h2>
            {mode === "login"
              ? "Sign in to Resource Hub"
              : mode === "forgot"
                ? "Recover your account"
                : "Create a new password"}
          </h2>
          <p className="muted">
            {mode === "login"
              ? "Use your Mapúa University account to continue."
              : mode === "forgot"
                ? "Enter your email and we’ll send a secure reset link."
                : "Choose a strong password for your Resource Hub account."}
          </p>
          {message && <div className="notice">{message}</div>}
          <form onSubmit={submit}>
            {mode === "forgot" && (
              <Field
                label="University email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@mapua.edu.ph"
              />
            )}
            {mode === "reset" && (
              <>
                <Field
                  label="New password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 4 characters"
                />
                <Field
                  label="Confirm password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Repeat your password"
                />
              </>
            )}
            {mode === "login" && (
              <>
                <Field
                  label="University email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@mapua.edu.ph"
                />
                <div className="field">
                  <label>Password</label>
                  <div className="password">
                    <input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShow(!show)}>
                      {show ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="form-row">
                  <label className="check">
                    <input type="checkbox" /> Remember me
                  </label>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setMode("forgot");
                      setMessage("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            <Button type="submit">
              {mode === "login"
                ? "Sign in"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Update password"}
            </Button>
          </form>
          {mode !== "login" && (
            <button
              className="back-link"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              ← Back to sign in
            </button>
          )}
          <p className="auth-footer">
            Cardinal Resource Hub
          </p>
        </div>
      </section>
    </div>
  );
}

function Shell({
  role,
  organizationName,
  page,
  setPage,
  onLogout,
  children,
}: {
  role: Role;
  organizationName?: string;
  page: Page;
  setPage: (p: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const info = roleInfo[role];
  const displayName = role === "organization" ? organizationName ?? info.name : info.name;
  const nav =
    role === "organization"
      ? [
          ["dashboard", "Overview", "⌂"],
          ["facilities", "Facilities", "▦"],
          ["equipment", "Equipment", "▣"],
          ["requests", "My requests", "☷"],
          ["bookings", "Approved bookings", "✓"],
          ["history", "Booking history", "◷"],
        ]
      : role === "faculty"
        ? [
            ["dashboard", "Overview", "⌂"],
            ["requests", "Faculty review", "☷"],
            ["history", "Approval history", "◷"],
          ]
        : role === "admin"
          ? [
              ["dashboard", "Overview", "⌂"],
              ["requests", "Final booking review", "☷"],
              ["management", "Manage resources", "▦"],
              ["organizations", "Organizations", "◎"],
              ["bookings", "Approved bookings", "✓"],
              ["history", "Booking records", "◷"],
            ]
          : role === "maintenance"
            ? [
                ["dashboard", "Overview", "⌂"],
                ["requests", "Maintenance queue", "☷"],
                ["equipment", "Equipment", "▣"],
                ["history", "Completed setups", "✓"],
              ]
            : [
                ["dashboard", "Overview", "⌂"],
                ["requests", "Dean review", "☷"],
                ["history", "Final decisions", "◷"],
              ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <img
          className="sidebar-logo-only"
          src="/mapua-logo.png"
          alt="Mapua University"
        />
        <div className="campus">
          MAKATI CAMPUS <span>•</span> 2026–27
        </div>
        <nav>
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => setPage(id as Page)}
            >
              <Icon>{icon}</Icon>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user">
            <span className="avatar">{info.initials}</span>
            <span>
              <b>{displayName}</b>
              <small>{info.label}</small>
            </span>
            <button
              className="logout"
              onClick={() => {
                if (window.confirm("Are you sure you want to sign out?")) {
                  onLogout();
                }
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span className="topbar-label">CARDINAL RESOURCE HUB</span>
            <span className="slash">/</span>
            <span>{info.label}</span>
          </div>
          <div className="top-actions">
            <span className="notification">◌</span>
            <span className="online">
              <i /> Campus operations online
            </span>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
function Header({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
      </div>
      {action}
    </div>
  );
}
function Stat({
  label,
  value,
  tone = "red",
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div className={`stat stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
function BookingList({
  data,
  onSelect,
}: {
  data: Booking[];
  onSelect?: (b: Booking) => void;
}) {
  return (
    <div className="booking-list">
      {data.map((b) => (
        <button
          className="booking-row"
          key={b.id}
          onClick={() => onSelect?.(b)}
        >
          <span className="date-block">
            <b>{b.date.split(" ")[1]?.replace(",", "")}</b>
            <small>{b.date.split(" ")[0]}</small>
          </span>
          <span className="booking-info">
            <b>{b.event}</b>
            <small>
              {b.org} · {b.venue}
            </small>
          </span>
          <span className="booking-time">{b.time}</span>
          <Status value={b.status} />
        </button>
      ))}
    </div>
  );
}

function Dashboard({
  role,
  bookings,
  facilities: availableFacilities,
  organizationName,
  onAction,
  onBook,
}: {
  role: Role;
  bookings: Booking[];
  facilities: typeof facilities;
  organizationName?: string;
  onAction: (p: Page) => void;
  onBook?: () => void;
}) {
  const faculty = role === "faculty";
  const admin = role === "admin";
  const maintenance = role === "maintenance";
  const organization = role === "organization";
  const dean = role === "dean";
  const pendingReview = bookings.filter((booking) =>
    ["Faculty review", "Maintenance review", "Admin review", "Dean review"].includes(
      booking.status,
    ),
  ).length;
  const approvedBookings = bookings.filter((booking) =>
    ["Approved", "Prepared"].includes(booking.status),
  ).length;
  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "Rejected",
  ).length;
  const onTrack = bookings.length
    ? Math.round(((bookings.length - rejectedBookings) / bookings.length) * 100)
    : 0;
  return (
    <>
      <Header
        eyebrow={`${roleInfo[role].label.toUpperCase()} / OVERVIEW`}
        title={
          faculty
            ? "Good morning, Professor Santos."
            : admin
              ? "Operations overview"
              : dean
                ? "Dean Villanueva, final decisions"
                : maintenance
                ? "Ready for today’s setup."
                : `Good morning, ${organizationName ?? "organization team"}.`
        }
        sub={
          faculty
            ? "Review event submissions before they move to maintenance."
            : admin
              ? "Confirm bookings after faculty approval and maintenance handling."
              : dean
                ? "Make the final call on budget, policy, and campus rules for administrator-cleared bookings."
                : maintenance
                ? "Handle equipment and setup after faculty approval."
                : "Submit events and follow them through every approval stage."
        }
        action={onBook && <Button onClick={onBook}>＋ New booking</Button>}
      />
      <div className="stats">
        {faculty ? (
          <>
            <Stat label="Faculty review" value={bookings.filter((booking) => booking.status === "Faculty review").length} tone="amber" />
            <Stat label="Approved this term" value={approvedBookings} tone="green" />
            <Stat label="Approval rate" value={`${onTrack}%`} tone="blue" />
          </>
        ) : admin ? (
          <>
            <Stat label="Final review" value={pendingReview} tone="amber" />
            <Stat label="Approved bookings" value={approvedBookings} tone="green" />
            <Stat label="Active venues" value={availableFacilities.filter((facility) => facility.status === "Available").length} tone="blue" />
          </>
        ) : dean ? (
          <>
            <Stat label="Dean review" value={bookings.filter((booking) => booking.status === "Dean review").length} tone="amber" />
            <Stat label="Final decisions" value={bookings.filter((booking) => ["Approved", "Rejected"].includes(booking.status)).length} tone="green" />
            <Stat label="Budget checks" value={bookings.filter((booking) => booking.status === "Dean review").length} tone="blue" />
          </>
        ) : maintenance ? (
          <>
            <Stat label="Maintenance queue" value={bookings.filter((booking) => booking.status === "Maintenance review").length} tone="amber" />
            <Stat label="Ready for pickup" value={bookings.filter((booking) => booking.status === "Prepared").length} tone="green" />
            <Stat label="This week" value={bookings.length} tone="blue" />
          </>
        ) : organization ? (
          <>
            <Stat
              label="Requests in progress"
              value={bookings.length}
              tone="amber"
            />
            <Stat label="Approved bookings" value={approvedBookings} tone="green" />
            <Stat label="Available facilities" value={availableFacilities.filter((facility) => facility.status === "Available").length} tone="blue" />
          </>
        ) : null}
      </div>
      <div className="dashboard-grid">
        <Panel
          title={
            faculty
              ? "Requests for faculty review"
              : dean
                ? "Dean decisions"
                : maintenance
                ? "Maintenance queue"
                : admin
                  ? "Final booking review"
                  : "Recent requests"
          }
          action={
            <button
              className="text-button"
              onClick={() => onAction("requests")}
            >
              View all →
            </button>
          }
        >
          <BookingList data={bookings} />
        </Panel>
        <Panel title={organization ? "Your workflow" : "Workflow status"}>
          <div className="pulse">
            <div>
              <span className="pulse-number">{organization ? "3" : `${onTrack}%`}</span>
              <span className="muted">
                {organization ? "approval stages" : "of requests are on track"}
              </span>
            </div>
            <div className="bar">
                <i style={{ width: organization ? "33%" : `${onTrack}%` }} />
            </div>
            <p>
              {dean
                ? "Review administrator-cleared requests and approve or reject them based on budget, policy, and campus rules."
                : organization
                ? "Faculty review comes first, followed by maintenance handling, then final administrator confirmation."
                : "Campus operations are running normally. No system alerts today."}
            </p>
            <Button
              secondary
              onClick={() => onAction(organization ? "requests" : "requests")}
            >
              Open work queue
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

function StudentView({
  page,
  setPage,
  bookings,
  setBookings,
  facilities: availableFacilities,
  equipment: availableEquipment,
  organizations,
  activeOrganizationId,
}: {
  page: Page;
  setPage: (p: Page) => void;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  facilities: typeof facilities;
  equipment: typeof equipment;
  organizations: Organization[];
  activeOrganizationId: number;
}) {
  const [selectedFacility, setSelectedFacility] = useState<
    (typeof facilities)[0] | null
  >(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const currentOrganization =
    organizations.find((item) => item.id === activeOrganizationId) ??
    organizations[0];
  const my = bookings.filter((b) => b.orgId === activeOrganizationId);
  if (showForm)
    return (
      <BookingForm
        organization={currentOrganization}
        facilities={availableFacilities}
        venue={selectedFacility?.name}
        onCancel={() => setShowForm(false)}
        onSubmit={async (b) => {
          const [startTime, endTime] = b.time.split(" – ");
          const response = await fetch(`${apiBase}/api/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orgId: b.orgId,
              roomId: b.roomId,
              eventName: b.event,
              participantCount: b.people,
              eventDate: b.eventDate,
              startTime,
              endTime,
              purpose: b.purpose,
            }),
          });
          if (!response.ok) return;
          const bookingsResponse = await fetch(`${apiBase}/api/bookings`);
          const rows = (await bookingsResponse.json()) as Record<string, string | number>[];
          setBookings(rows.map(mapBooking));
          setShowForm(false);
          setSubmitted(true);
          setPage("requests");
        }}
      />
    );
  if (page === "facilities")
    return (
      <>
        <Header
          eyebrow="RESOURCES / FACILITIES"
          title="Find a place for your event."
          sub="Choose a venue from the list, then start a request with that venue already selected."
        />
        <div className="filter-row">
          <input
            className="search"
            placeholder="Search facilities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="filter-note">
            {
              availableFacilities.filter((f) =>
                f.name.toLowerCase().includes(query.toLowerCase()),
              ).length
            }{" "}
            venues
          </span>
        </div>
        {selectedFacility ? (
          <Detail
            facility={selectedFacility}
            onBack={() => setSelectedFacility(null)}
            onBook={() => setShowForm(true)}
          />
        ) : (
          <div className="venue-list">
            {availableFacilities
              .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
              .map((f) => (
                <button
                  className="venue-row"
                  key={f.name}
                  onClick={() => setSelectedFacility(f)}
                >
                  <span className="venue-icon">▦</span>
                  <span>
                    <b>{f.name}</b>
                    <small>
                      {f.type} · {f.location}
                    </small>
                  </span>
                  <span className="venue-capacity">{f.capacity} seats</span>
                  <Status value={f.status} />
                </button>
              ))}
          </div>
        )}
      </>
    );
  if (page === "equipment")
    return (
      <>
        <Header
          eyebrow="RESOURCES / EQUIPMENT"
          title="Everything your event needs."
          sub="Check live inventory before adding equipment to a booking request."
        />
        <Panel title="Equipment inventory">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {availableEquipment.map((e) => (
                  <tr key={e.name}>
                    <td>
                      <b>{e.name}</b>
                    </td>
                    <td>{e.category}</td>
                    <td>
                      {e.available} / {e.total}
                    </td>
                    <td>{e.condition}</td>
                    <td>
                      <span
                        className={
                          e.available ? "dot-label good" : "dot-label bad"
                        }
                      >
                        {e.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </>
    );
  if (page === "requests" || page === "bookings" || page === "history")
    return (
      <>
        <Header
          eyebrow={`ORGANIZATION / ${page.toUpperCase()}`}
          title={
            page === "requests"
              ? "My booking requests"
              : page === "bookings"
                ? "Approved bookings"
                : "Booking history"
          }
          sub="Track your request from faculty review to maintenance handling and final admin confirmation."
        />
        {submitted && (
          <div className="notice success">
            Your request was submitted and is now waiting for faculty review.
          </div>
        )}
        <Panel
          title={page === "requests" ? "Active requests" : "All reservations"}
        >
          <BookingList
            data={
              page === "bookings"
                ? my.filter((b) => ["Approved", "Prepared"].includes(b.status))
                : my
            }
          />
        </Panel>
      </>
    );
  return (
    <Dashboard
      role="organization"
      bookings={my}
      facilities={availableFacilities}
      organizationName={currentOrganization?.name}
      onAction={setPage}
      onBook={() => setShowForm(true)}
    />
  );
}
function Detail({
  facility,
  onBack,
  onBook,
}: {
  facility: (typeof facilities)[0];
  onBack: () => void;
  onBook: () => void;
}) {
  return (
    <div className="detail">
      <button className="back-link" onClick={onBack}>
        ← All facilities
      </button>
      <div className="detail-grid">
        <div className="detail-visual">
          <span>▦</span>
          <em className="available">{facility.status}</em>
        </div>
        <div>
          <span className="eyebrow">{facility.type}</span>
          <h2>{facility.name}</h2>
          <p className="muted">{facility.detail}</p>
          <dl className="detail-list">
            <div>
              <dt>Location</dt>
              <dd>{facility.location}</dd>
            </div>
            <div>
              <dt>Capacity</dt>
              <dd>{facility.capacity} people</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{facility.status}</dd>
            </div>
          </dl>
          <Button onClick={onBook}>Start a booking request</Button>
        </div>
      </div>
    </div>
  );
}
function BookingForm({
  organization,
  facilities: availableFacilities,
  venue: initialVenue,
  onCancel,
  onSubmit,
}: {
  organization: Organization;
  facilities: typeof facilities;
  venue?: string;
  onCancel: () => void;
  onSubmit: (b: Booking) => void;
}) {
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState(
    initialVenue ??
      availableFacilities.find((f) => f.status === "Available")?.name ??
      availableFacilities[0]?.name ??
      "",
  );
  const [people, setPeople] = useState("50");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <Header
        eyebrow="NEW REQUEST"
        title="Create a booking request"
        sub={`Requesting as ${organization.name}. Choose or confirm the venue below.`}
      />
      <div className="form-layout">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (!event || !date || !purpose) {
              setError("Event name, date, and purpose are required.");
              return;
            }
            onSubmit({
              id: `BR-2026-${String(Date.now()).slice(-3)}`,
              event,
              orgId: organization.id,
              org: organization.name,
              venue,
              date: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }),
              time: "9:00 AM – 4:00 PM",
              people: Number(people),
              status: "Faculty review",
              equipment: [],
              purpose,
              requestedByUserId: 101,
              roomId: availableFacilities.findIndex((f) => f.name === venue) + 1,
              eventDate: date,
            });
          }}
        >
          <div className="form-section">
            <h3>Event information</h3>
            <div className="form-grid">
              <div className="field full">
                <label>Organization</label>
                <div className="locked-field">
                  {organization.name}
                  <small>{organization.email}</small>
                </div>
              </div>
              <Field
                label="Event name"
                type="text"
                value={event}
                onChange={setEvent}
                placeholder="e.g. General Assembly"
              />
              <Field
                label="Participants"
                type="number"
                value={people}
                onChange={setPeople}
                placeholder="50"
              />
              <Field
                label="Event date"
                type="date"
                value={date}
                onChange={setDate}
                placeholder=""
              />
              <div className="field">
                <label>Start and end time</label>
                <div className="time-row">
                  <input type="time" defaultValue="09:00" />
                  <input type="time" defaultValue="16:00" />
                </div>
              </div>
              <div className="field full">
                <label>Event purpose</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="What will happen at your event?"
                  rows={4}
                />
              </div>
              <div className="field full">
                <label>Venue</label>
                <select
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                >
                  {availableFacilities
                    .filter((f) => f.status === "Available")
                    .map((f) => (
                      <option key={f.name}>{f.name}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Required documents</h3>
            <div className="upload">
              <b>＋</b>
              <span>Upload letter of intent or program flow</span>
              <small>PDF or DOCX · up to 10 MB</small>
            </div>
          </div>
          {error && <div className="notice error">{error}</div>}
          <div className="form-actions">
            <Button secondary onClick={onCancel}>
              Back to resources
            </Button>
            <Button type="submit">Review and submit</Button>
          </div>
        </form>
        <aside className="form-aside">
          <span className="eyebrow">WHAT HAPPENS NEXT</span>
          <ol>
            <li>
              <b>Faculty review</b>
              <span>Your adviser checks the event details and documents.</span>
            </li>
            <li>
              <b>Maintenance handling</b>
              <span>
                Equipment and setup are checked after faculty approval.
              </span>
            </li>
            <li>
              <b>Admin confirmation</b>
              <span>
                The administrator completes final management and monitoring.
              </span>
            </li>
          </ol>
        </aside>
      </div>
    </>
  );
}

function StaffView({
  role,
  page,
  setPage,
  bookings,
  setBookings,
  facilities: availableFacilities,
  equipment: availableEquipment,
  organizations,
  setOrganizations,
}: {
  role: Role;
  page: Page;
  setPage: (p: Page) => void;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  facilities: typeof facilities;
  equipment: typeof equipment;
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
}) {
  const [selected, setSelected] = useState<Booking | null>(null);
  if (page === "management") {
    return (
      <Management
        facilities={availableFacilities}
        equipment={availableEquipment}
      />
    );
  }
  if (page === "organizations")
    return (
      <Organizations
        organizations={organizations}
        setOrganizations={setOrganizations}
      />
    );
  if (page === "equipment")
    return (
      <>
        <Header
          eyebrow="MAINTENANCE / INVENTORY"
          title="Equipment inventory"
          sub="Check quantities and condition before confirming a setup."
        />
        <Panel title="Current inventory">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                {availableEquipment.map((e) => (
                  <tr key={e.name}>
                    <td>
                      <b>{e.name}</b>
                    </td>
                    <td>{e.category}</td>
                    <td>
                      {e.available} / {e.total}
                    </td>
                    <td>{e.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </>
    );
  if (page === "requests" || page === "history" || page === "bookings") {
    const queue =
      role === "faculty"
        ? page === "history"
          ? bookings.filter((b) =>
              [
                "Maintenance review",
                "Admin review",
                "Approved",
                "Prepared",
              ].includes(b.status),
            )
          : bookings.filter((b) => b.status === "Faculty review")
        : role === "maintenance"
          ? bookings.filter((b) => b.status === "Maintenance review")
          : role === "admin"
            ? page === "bookings"
              ? bookings.filter((b) => ["Approved", "Prepared"].includes(b.status))
              : page === "history"
                ? bookings
                : bookings.filter((b) => b.status === "Admin review")
            : role === "dean"
              ? page === "history"
                ? bookings.filter((b) => ["Approved", "Rejected"].includes(b.status))
                : bookings.filter((b) => b.status === "Dean review")
              : page === "bookings"
                ? bookings.filter((b) => ["Approved", "Prepared"].includes(b.status))
                : bookings;
    const title =
      role === "faculty"
        ? page === "history"
          ? "Approved request history"
          : "Faculty event review"
        : role === "maintenance"
          ? "Maintenance handling"
          : role === "dean"
            ? page === "history"
              ? "Final decision history"
              : "Dean final review"
          : page === "bookings"
            ? "Approved and upcoming bookings"
            : "Booking records";
    const readOnly = page === "history" || page === "bookings";
    return (
      <>
        <Header
          eyebrow={`${roleInfo[role].label.toUpperCase()} / WORK QUEUE`}
          title={title}
          sub={
            role === "faculty"
              ? "History shows requests that passed faculty review."
              : role === "maintenance"
                ? "Confirm equipment and setup after faculty approval."
                : role === "dean"
                  ? "Make the final decision on budget, policy, and campus rules after Admin review."
                : page === "bookings"
                  ? "Approved bookings that are upcoming or currently in progress."
                  : "Complete management records and history."
          }
        />
        <Panel title={page === "history" ? "Records" : "Assigned work queue"}>
          <BookingList data={queue} onSelect={setSelected} />
        </Panel>
        {selected && (
          <Review
            booking={selected}
            role={role}
            readOnly={readOnly}
            onClose={() => setSelected(null)}
            onUpdate={async (status) => {
              const reviewerId =
                role === "faculty"
                  ? 1
                  : role === "admin"
                    ? 2
                    : role === "maintenance"
                      ? 3
                      : 4;
              const response = await fetch(
                import.meta.env.DEV
                  ? `${apiBase}/api/bookings/${selected.id}/status`
                  : `${apiBase}/api/bookings?id=${selected.id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    status,
                    userId: reviewerId,
                  }),
                },
              );
              if (!response.ok) return;
              setBookings(
                bookings.map((b) =>
                  b.id === selected.id ? { ...b, status } : b,
                ),
              );
              setSelected(null);
            }}
          />
        )}
      </>
    );
  }
  return (
    <Dashboard
      role={role}
      bookings={bookings}
      facilities={availableFacilities}
      onAction={setPage}
    />
  );
}
function Review({
  booking,
  role,
  readOnly = false,
  onClose,
  onUpdate,
}: {
  booking: Booking;
  role: Role;
  readOnly?: boolean;
  onClose: () => void;
  onUpdate: (s: Status) => void;
}) {
  const nextStatus =
    role === "faculty"
      ? "Maintenance review"
      : role === "maintenance"
        ? "Admin review"
        : role === "admin"
          ? "Dean review"
        : "Approved";
  const approveLabel =
    role === "faculty"
      ? "Approve for maintenance"
      : role === "maintenance"
        ? "Confirm maintenance complete"
        : role === "admin"
          ? "Send to Dean"
          : "Confirm final booking";
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <span className="eyebrow">
          {booking.id} · {roleInfo[role].label}
        </span>
        <h2>{booking.event}</h2>
        <p className="muted">
          {booking.org} · {booking.venue} · {booking.date}
        </p>
        <div className="review-grid">
          <div>
            <span>Date & time</span>
            <b>
              {booking.date}
              <br />
              {booking.time}
            </b>
          </div>
          <div>
            <span>Participants</span>
            <b>{booking.people} people</b>
          </div>
          <div>
            <span>Purpose</span>
            <b>{booking.purpose}</b>
          </div>
          <div>
            <span>Current status</span>
            <Status value={booking.status} />
          </div>
        </div>
        {!readOnly && (
          <>
            <textarea
              placeholder="Add remarks for the organization..."
              rows={3}
            />
            <div className="form-actions">
              <Button secondary onClick={() => onUpdate("Rejected")}>
                Reject
              </Button>
              <Button onClick={() => onUpdate(nextStatus)}>
                {approveLabel}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function Organizations({
  organizations,
  setOrganizations,
}: {
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
}) {
  const [editing, setEditing] = useState<Organization | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facultyAdviser, setFacultyAdviser] = useState("Prof. Maria Santos");
  const [message, setMessage] = useState("");
  const startCreate = () => {
    setEditing({
      id: 0,
      name: "",
      email: "",
      password: "",
      facultyAdviser: "Prof. Maria Santos",
      status: "Active",
    });
    setName("");
    setEmail("");
    setPassword("");
    setMessage("");
  };
  const startEdit = (organization: Organization) => {
    setEditing(organization);
    setName(organization.name);
    setEmail(organization.email);
    setPassword(organization.password);
    setFacultyAdviser(organization.facultyAdviser);
    setMessage("");
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (editing?.id)
      setOrganizations(
        organizations.map((item) =>
          item.id === editing.id
            ? { ...item, name, email, password, facultyAdviser }
            : item,
        ),
      );
    else {
      const response = await fetch(`${apiBase}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, facultyAdviser }),
      });
      if (!response.ok) {
        setMessage("Unable to create the organization account.");
        return;
      }
      const created = await response.json();
      setOrganizations([
        ...organizations,
        {
          id: Number(created.org_id),
          name: String(created.org_name),
          email: String(created.contact_email),
          password: "",
          facultyAdviser,
          status: "Active",
        },
      ]);
    }
    setEditing(null);
    setMessage(`${name} is now available as an organization account.`);
  };
  return (
    <>
      <Header
        eyebrow="ADMINISTRATION / ORGANIZATIONS"
        title="Organization directory"
        sub="Manage separate organization accounts that can submit and track booking requests."
        action={<Button onClick={startCreate}>＋ Add organization</Button>}
      />
      {message && <div className="notice success">{message}</div>}
      {editing && (
        <div className="modal-backdrop">
          <form className="modal org-modal" onSubmit={save}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setEditing(null)}
            >
              ×
            </button>
            <span className="eyebrow">
              {editing.id ? "EDIT ORGANIZATION" : "NEW ORGANIZATION"}
            </span>
            <h2>
              {editing.id
                ? "Update organization account"
                : "Add organization account"}
            </h2>
            <p className="muted">
              Create the credentials the organization will use to access
              Resource Hub.
            </p>
            <Field
              label="Organization name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="e.g. Engineering Student Council"
            />
            <Field
              label="Organization email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="organization@mapua.edu.ph"
            />
            <Field
              label="Account password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Temporary password"
            />
            <Field
              label="Faculty adviser"
              type="text"
              value={facultyAdviser}
              onChange={setFacultyAdviser}
              placeholder="Prof. Name"
            />
            <div className="form-actions">
              <Button secondary onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save organization</Button>
            </div>
          </form>
        </div>
      )}
      <Panel title={`${organizations.length} registered organizations`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Faculty adviser</th>
                <th>Contact</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {organizations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{item.name}</b>
                    <small>OrgID {item.id}</small>
                  </td>
                  <td>{item.facultyAdviser}</td>
                  <td>{item.email}</td>
                  <td>
                    <Status value={item.status} />
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-button table-action"
                      onClick={() =>
                        setOrganizations(
                          organizations.map((current) =>
                            current.id === item.id
                              ? {
                                  ...current,
                                  status:
                                    current.status === "Inactive"
                                      ? "Active"
                                      : "Inactive",
                                }
                              : current,
                          ),
                        )
                      }
                    >
                      {item.status === "Inactive" ? "Activate" : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
function Management({
  facilities: availableFacilities,
  equipment: availableEquipment,
}: {
  facilities: typeof facilities;
  equipment: typeof equipment;
}) {
  const [tab, setTab] = useState<"facilities" | "equipment" | "availability">(
    "facilities",
  );
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Facility");
  const [message, setMessage] = useState("");
  const [facilityRows, setFacilityRows] = useState(availableFacilities);
  const [equipmentRows, setEquipmentRows] = useState(availableEquipment);
  const addResource = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (category === "Equipment")
      setEquipmentRows([
        ...equipmentRows,
        { name, category: "General", available: 0, total: 0, condition: "New" },
      ]);
    else
      setFacilityRows([
        ...facilityRows,
        {
          name,
          type: "Campus resource",
          location: "To be assigned",
          capacity: 0,
          status: "Available",
          detail: "Newly added campus facility.",
        },
      ]);
    setMessage(`${name} was added to the ${category.toLowerCase()} registry.`);
    setName("");
    setShowAdd(false);
  };
  return (
    <>
      <Header
        eyebrow="ADMINISTRATION / RESOURCES"
        title="Manage campus resources"
        sub="Keep facility and equipment information accurate for every requester."
        action={
          <Button onClick={() => setShowAdd(true)}>＋ Add resource</Button>
        }
      />
      {message && <div className="notice success">{message}</div>}
      <div className="tabs">
        <button
          className={tab === "facilities" ? "selected" : ""}
          onClick={() => setTab("facilities")}
        >
          Facilities <b>{facilityRows.length}</b>
        </button>
        <button
          className={tab === "equipment" ? "selected" : ""}
          onClick={() => setTab("equipment")}
        >
          Equipment <b>{equipmentRows.length}</b>
        </button>
        <button
          className={tab === "availability" ? "selected" : ""}
          onClick={() => setTab("availability")}
        >
          Availability
        </button>
      </div>
      {tab === "facilities" && (
        <Panel title="Facilities">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {facilityRows.map((f) => (
                  <tr key={f.name}>
                    <td>
                      <b>{f.name}</b>
                      <small>{f.location}</small>
                    </td>
                    <td>{f.type}</td>
                    <td>{f.capacity || "—"}</td>
                    <td>
                      <Status value={f.status} />
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() =>
                          setMessage(`${f.name} is ready to edit.`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {tab === "equipment" && (
        <Panel title="Equipment inventory">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Condition</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {equipmentRows.map((item) => (
                  <tr key={item.name}>
                    <td>
                      <b>{item.name}</b>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      {item.available} / {item.total}
                    </td>
                    <td>{item.condition}</td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() =>
                          setMessage(`${item.name} is ready to edit.`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {tab === "availability" && (
        <Panel title="Availability management">
          <div className="availability-list">
            {facilityRows.map((f) => (
              <div key={f.name}>
                <span>
                  <b>{f.name}</b>
                  <small>{f.location}</small>
                </span>
                <button
                  className={`availability-toggle ${f.status === "Available" ? "on" : ""}`}
                  onClick={() =>
                    setFacilityRows(
                      facilityRows.map((item) =>
                        item.name === f.name
                          ? {
                              ...item,
                              status:
                                item.status === "Available"
                                  ? "Unavailable"
                                  : "Available",
                            }
                          : item,
                      ),
                    )
                  }
                >
                  {f.status}
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {showAdd && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={addResource}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowAdd(false)}
            >
              ×
            </button>
            <span className="eyebrow">NEW RESOURCE</span>
            <h2>Add a resource</h2>
            <p className="muted">
              Add a facility or equipment record to the shared registry.
            </p>
            <Field
              label="Resource name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="e.g. Seminar Room B"
            />
            <div className="field">
              <label>Resource type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Facility</option>
                <option>Equipment</option>
              </select>
            </div>
            <div className="form-actions">
              <Button secondary onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit">Add resource</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
function Profile({ role }: { role: Role }) {
  const info = roleInfo[role];
  const [message, setMessage] = useState("");
  return (
    <>
      <Header
        eyebrow="ACCOUNT"
        title="Your profile"
        sub="Account information connected to your Mapúa University identity."
      />
      {message && <div className="notice success">{message}</div>}
      <div className="profile-card">
        <span className="big-avatar">{info.initials}</span>
        <div>
          <h2>{info.name}</h2>
          <p className="muted">
            {roleInfo[role].label} ·{" "}
            {role === "organization"
              ? "ssc@mapua.edu.ph"
              : `${role}@mapua.edu.ph`}
          </p>
        </div>
        <Button
          secondary
          onClick={() =>
            setMessage("Your profile update request has been recorded.")
          }
        >
          Update details
        </Button>
        <dl>
          <div>
            <dt>Campus</dt>
            <dd>Mapúa University – Makati</dd>
          </div>
          <div>
            <dt>Account status</dt>
            <dd className="good-text">Active</dd>
          </div>
          <div>
            <dt>Last sign in</dt>
            <dd>Today, 8:42 AM</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [liveFacilities, setLiveFacilities] = useState<typeof facilities>([]);
  const [liveEquipment, setLiveEquipment] = useState<typeof equipment>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState(1);
  useEffect(() => {
    Promise.all([
      fetch(`${apiBase}/api/bookings`),
      fetch(`${apiBase}/api/resources`),
    ])
      .then(async ([bookingsResponse, resourcesResponse]) => {
        if (!bookingsResponse.ok || !resourcesResponse.ok) {
          throw new Error("Unable to load application data");
        }
        return {
          bookings: (await bookingsResponse.json()) as Record<string, string | number>[],
          resources: (await resourcesResponse.json()) as {
            rooms: Record<string, string | number>[];
            equipment: Record<string, string | number>[];
            organizations: Record<string, string | number | null>[];
          },
        };
      })
      .then(({ bookings: rows, resources }) => {
        setBookings(rows.map(mapBooking));
        setLiveFacilities(
          resources.rooms.map((room) => ({
            name: String(room.room_name),
            type: "Campus venue",
            location: String(room.location),
            capacity: Number(room.capacity),
            status: String(room.availability_status),
            detail: `${room.location} venue with capacity for ${room.capacity} people.`,
          })),
        );
        setOrganizations(
          resources.organizations.map((organization) => ({
            id: Number(organization.org_id),
            name: String(organization.org_name),
            email: String(organization.contact_email),
            password: "",
            facultyAdviser: String(organization.faculty_adviser ?? "Unassigned"),
            status: String(organization.status) as Organization["status"],
          })),
        );
        setLiveEquipment(
          resources.equipment.map((item) => ({
            name: String(item.equipment_name),
            category: String(item.category),
            available: Number(item.quantity_available),
            total: Number(item.quantity_available),
            condition: String(item.status),
          })),
        );
      })
      .catch(() => {
        setBookings([]);
        setLiveFacilities([]);
        setLiveEquipment([]);
        setOrganizations([]);
      });
  }, []);
  if (!role)
    return (
      <Auth
        organizations={organizations}
        onLogin={(nextRole, organizationId) => {
          setRole(nextRole);
          setActiveOrganizationId(organizationId ?? 1);
          setPage("dashboard");
        }}
      />
    );
  return (
    <Shell
      role={role}
      organizationName={
        role === "organization"
          ? organizations.find((item) => item.id === activeOrganizationId)?.name
          : undefined
      }
      page={page}
      setPage={setPage}
      onLogout={() => setRole(null)}
    >
      {role === "organization" ? (
        <StudentView
          page={page}
          setPage={setPage}
          bookings={bookings}
          setBookings={setBookings}
          facilities={liveFacilities}
          equipment={liveEquipment}
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
      ) : (
        <StaffView
          role={role}
          page={page}
          setPage={setPage}
          bookings={bookings}
          setBookings={setBookings}
          facilities={liveFacilities}
          equipment={liveEquipment}
          organizations={organizations}
          setOrganizations={setOrganizations}
        />
      )}
    </Shell>
  );
}
