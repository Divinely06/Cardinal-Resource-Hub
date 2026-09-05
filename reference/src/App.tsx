import { useState, useRef } from "react";

// ─── Color tokens ───────────────────────────────────────────────────────────
const RED = "#C8102E";
const RED_DARK = "#a00d24";
const RED_LIGHT = "#fdf2f4";
const SIDEBAR_BG = "#1a1a2e";
const SIDEBAR_TEXT = "#c8d0e0";
const SIDEBAR_ACTIVE = "#C8102E";

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = "student" | "faculty" | "admin" | "maintenance";

type BookingStatus =
  | "pending"
  | "faculty_review"
  | "faculty_approved"
  | "faculty_rejected"
  | "admin_review"
  | "admin_approved"
  | "admin_rejected"
  | "maintenance_check"
  | "available"
  | "prepared"
  | "completed";

interface Facility {
  id: string;
  name: string;
  capacity: number;
  location: string;
  type: string;
  status: "available" | "unavailable";
  description: string;
}

interface Equipment {
  id: string;
  name: string;
  totalQty: number;
  availableQty: number;
  category: string;
  condition: string;
  status: "available" | "unavailable";
}

interface BookingRequest {
  id: string;
  orgName: string;
  eventName: string;
  eventDescription: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  facilityId: string;
  equipmentItems: { equipmentId: string; quantity: number }[];
  documents: string[];
  status: BookingStatus;
  facultyRemarks?: string;
  adminRemarks?: string;
  maintenanceStatus?: string;
  submittedAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const FACILITIES: Facility[] = [
  {
    id: "f1",
    name: "Multi-Purpose Hall",
    capacity: 200,
    location: "Building A, Ground Floor",
    type: "Event Hall",
    status: "available",
    description: "Large hall suitable for major events, seminars, and assemblies. Equipped with stage and sound system.",
  },
  {
    id: "f2",
    name: "Function Room 1",
    capacity: 50,
    location: "Building B, 2nd Floor",
    type: "Meeting Room",
    status: "available",
    description: "Medium-sized function room with projector and whiteboard. Ideal for workshops and organizational meetings.",
  },
  {
    id: "f3",
    name: "Audio-Visual Room",
    capacity: 80,
    location: "Building C, 3rd Floor",
    type: "AV Room",
    status: "available",
    description: "AV-equipped room with built-in projector, surround sound, and stage lighting.",
  },
  {
    id: "f4",
    name: "Open Court",
    capacity: 300,
    location: "Campus Grounds",
    type: "Outdoor",
    status: "unavailable",
    description: "Outdoor basketball court suitable for large outdoor events and activities.",
  },
  {
    id: "f5",
    name: "Conference Room A",
    capacity: 30,
    location: "Building A, 4th Floor",
    type: "Conference Room",
    status: "available",
    description: "Executive conference room with video conferencing setup.",
  },
];

const EQUIPMENT: Equipment[] = [
  { id: "e1", name: "Wireless Microphone", totalQty: 10, availableQty: 8, category: "Audio", condition: "Good", status: "available" },
  { id: "e2", name: "LCD Projector", totalQty: 6, availableQty: 4, category: "Audiovisual", condition: "Good", status: "available" },
  { id: "e3", name: "Folding Tables", totalQty: 40, availableQty: 35, category: "Furniture", condition: "Good", status: "available" },
  { id: "e4", name: "Monobloc Chairs", totalQty: 200, availableQty: 150, category: "Furniture", condition: "Fair", status: "available" },
  { id: "e5", name: "Extension Cords", totalQty: 15, availableQty: 12, category: "Electrical", condition: "Good", status: "available" },
  { id: "e6", name: "LED Spotlight", totalQty: 8, availableQty: 2, category: "Lighting", condition: "Good", status: "available" },
  { id: "e7", name: "Podium / Lectern", totalQty: 3, availableQty: 3, category: "Furniture", condition: "Good", status: "available" },
  { id: "e8", name: "Speaker Set", totalQty: 4, availableQty: 0, category: "Audio", condition: "Good", status: "unavailable" },
  { id: "e9", name: "Backdrop Stand", totalQty: 5, availableQty: 4, category: "Display", condition: "Good", status: "available" },
  { id: "e10", name: "Portable Generator", totalQty: 2, availableQty: 1, category: "Electrical", condition: "Fair", status: "available" },
];

const BOOKINGS_INIT: BookingRequest[] = [
  {
    id: "BR-2026-001",
    orgName: "Supreme Student Council",
    eventName: "Leadership Summit 2026",
    eventDescription: "Annual leadership training and summit for all org officers.",
    date: "2026-09-20",
    startTime: "08:00",
    endTime: "17:00",
    participants: 150,
    facilityId: "f1",
    equipmentItems: [
      { equipmentId: "e1", quantity: 4 },
      { equipmentId: "e2", quantity: 2 },
      { equipmentId: "e3", quantity: 20 },
    ],
    documents: ["Letter of Intent.pdf", "Program Flow.pdf"],
    status: "admin_review",
    facultyRemarks: "Approved. Ensure proper venue setup.",
    submittedAt: "2026-09-05 09:14 AM",
  },
  {
    id: "BR-2026-002",
    orgName: "IT Students Society",
    eventName: "Tech Talk Series: AI in Industry",
    eventDescription: "Speaker series featuring industry professionals in AI and tech.",
    date: "2026-09-25",
    startTime: "13:00",
    endTime: "17:00",
    participants: 60,
    facilityId: "f3",
    equipmentItems: [
      { equipmentId: "e1", quantity: 2 },
      { equipmentId: "e2", quantity: 1 },
    ],
    documents: ["Request Letter.pdf"],
    status: "faculty_review",
    submittedAt: "2026-09-04 02:30 PM",
  },
  {
    id: "BR-2026-003",
    orgName: "Business Enthusiasts Club",
    eventName: "Entrepreneurship Fair 2026",
    eventDescription: "Annual fair showcasing student business projects.",
    date: "2026-10-05",
    startTime: "09:00",
    endTime: "16:00",
    participants: 200,
    facilityId: "f1",
    equipmentItems: [
      { equipmentId: "e3", quantity: 30 },
      { equipmentId: "e4", quantity: 100 },
      { equipmentId: "e9", quantity: 3 },
    ],
    documents: ["Event Proposal.pdf", "Consent Form.pdf"],
    status: "prepared",
    facultyRemarks: "Approved. Great initiative.",
    adminRemarks: "Approved. Coordinate with maintenance.",
    submittedAt: "2026-08-30 10:00 AM",
  },
  {
    id: "BR-2026-004",
    orgName: "Dance Ministry",
    eventName: "Pasko sa Mapúa Showcase",
    eventDescription: "Christmas cultural showcase with performances.",
    date: "2026-12-10",
    startTime: "17:00",
    endTime: "21:00",
    participants: 180,
    facilityId: "f3",
    equipmentItems: [
      { equipmentId: "e6", quantity: 4 },
      { equipmentId: "e1", quantity: 6 },
    ],
    documents: ["Letter of Intent.pdf"],
    status: "pending",
    submittedAt: "2026-09-03 11:45 AM",
  },
  {
    id: "BR-2026-005",
    orgName: "Supreme Student Council",
    eventName: "General Assembly Q3",
    eventDescription: "Quarterly general assembly for all student organizations.",
    date: "2026-09-15",
    startTime: "10:00",
    endTime: "12:00",
    participants: 80,
    facilityId: "f2",
    equipmentItems: [{ equipmentId: "e1", quantity: 2 }],
    documents: ["GA Agenda.pdf"],
    status: "completed",
    facultyRemarks: "Approved.",
    adminRemarks: "Approved.",
    submittedAt: "2026-09-01 08:00 AM",
  },
];

// ─── Utility functions ────────────────────────────────────────────────────────
function getFacility(id: string) {
  return FACILITIES.find((f) => f.id === id);
}
function getEquipment(id: string) {
  return EQUIPMENT.find((e) => e.id === id);
}

function statusLabel(s: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    pending: "Pending",
    faculty_review: "Faculty Review",
    faculty_approved: "Faculty Approved",
    faculty_rejected: "Faculty Rejected",
    admin_review: "Admin Review",
    admin_approved: "Admin Approved",
    admin_rejected: "Admin Rejected",
    maintenance_check: "For Checking",
    available: "Available",
    prepared: "Prepared",
    completed: "Completed",
  };
  return map[s];
}

function statusColor(s: BookingStatus) {
  if (s === "completed" || s === "prepared" || s === "admin_approved") return "text-green-700 bg-green-50 border-green-200";
  if (s === "faculty_rejected" || s === "admin_rejected") return "text-red-700 bg-red-50 border-red-200";
  if (s === "pending") return "text-yellow-700 bg-yellow-50 border-yellow-200";
  if (s === "faculty_review" || s === "admin_review" || s === "maintenance_check" || s === "available") return "text-blue-700 bg-blue-50 border-blue-200";
  return "text-gray-700 bg-gray-50 border-gray-200";
}

function formatDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium ${statusColor(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatCard({ label, value, color = "red" }: { label: string; value: number | string; color?: string }) {
  const colors: Record<string, string> = {
    red: "border-l-4 border-[#C8102E]",
    blue: "border-l-4 border-blue-500",
    green: "border-l-4 border-green-500",
    yellow: "border-l-4 border-yellow-500",
    gray: "border-l-4 border-gray-400",
  };
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${colors[color] || colors.red}`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
type SidebarItem = { label: string; page: string; icon: React.ReactNode };

function Sidebar({
  items,
  currentPage,
  onNav,
  onLogout,
  userLabel,
  roleLabel,
}: {
  items: SidebarItem[];
  currentPage: string;
  onNav: (p: string) => void;
  onLogout: () => void;
  userLabel: string;
  roleLabel: string;
}) {
  return (
    <aside
      className="flex flex-col h-full w-56 flex-shrink-0"
      style={{ background: SIDEBAR_BG, color: SIDEBAR_TEXT }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: RED }}
          >
            CRH
          </div>
          <div>
            <div className="text-white text-xs font-semibold leading-tight">Cardinal ResourceHub</div>
            <div className="text-xs leading-tight" style={{ color: SIDEBAR_TEXT, opacity: 0.6 }}>
              Mapúa University
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
        {items.map((item) => {
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNav(item.page)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors text-left"
              style={{
                background: active ? RED : "transparent",
                color: active ? "#fff" : SIDEBAR_TEXT,
                opacity: active ? 1 : 0.8,
              }}
            >
              <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ background: RED }}
          >
            {userLabel.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-xs font-medium truncate">{userLabel}</div>
            <div className="text-xs truncate" style={{ color: SIDEBAR_TEXT, opacity: 0.55 }}>
              {roleLabel}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors hover:bg-white/10"
          style={{ color: SIDEBAR_TEXT }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── App Layout Wrapper ───────────────────────────────────────────────────────
function AppLayout({
  children,
  sidebarItems,
  currentPage,
  onNav,
  onLogout,
  userLabel,
  roleLabel,
}: {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  currentPage: string;
  onNav: (p: string) => void;
  onLogout: () => void;
  userLabel: string;
  roleLabel: string;
}) {
  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <Sidebar
        items={sidebarItems}
        currentPage={currentPage}
        onNav={onNav}
        onLogout={onLogout}
        userLabel={userLabel}
        roleLabel={roleLabel}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  dashboard: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  building: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  equipment: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  ),
  clipboard: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  check: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  history: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  user: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  plus: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  wrench: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({
  onLogin,
  onForgot,
}: {
  onLogin: (role: Role) => void;
  onForgot: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const roleMap: Record<string, Role> = {
    "student@mapua.edu.ph": "student",
    "faculty@mapua.edu.ph": "faculty",
    "admin@mapua.edu.ph": "admin",
    "maintenance@mapua.edu.ph": "maintenance",
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const role = roleMap[email.toLowerCase()];
    if (role && password.length >= 4) {
      onLogin(role);
    } else {
      setError("Invalid credentials. Use the demo emails below.");
    }
  }

  return (
    <div className="min-h-full flex">
      {/* Left panel */}
      <div
        className="hidden md:flex flex-col justify-between w-5/12 p-10 text-white"
        style={{ background: RED }}
      >
        <div>
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-8">
            <span className="font-bold text-white text-sm">CRH</span>
          </div>
          <h1 className="text-3xl font-bold leading-snug mb-3">Cardinal ResourceHub</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            An Automated Facility and Equipment Reservation System for Mapúa University – Makati Campus.
          </p>
        </div>
        <div>
          <div className="border-t border-white/20 pt-6">
            <p className="text-xs text-white/60">School of Information Technology</p>
            <p className="text-xs text-white/60 mt-0.5">Mapúa University, Makati, Philippines</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden mb-8 text-center">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: RED }}
            >
              <span className="font-bold text-white text-sm">CRH</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Cardinal ResourceHub</h2>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">Access your ResourceHub account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="username@mapua.edu.ph"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": RED } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent pr-10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgot}
                className="text-xs hover:underline"
                style={{ color: RED }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
              style={{ background: RED }}
            >
              Sign In
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Demo Credentials (password: any 4+ chars)</p>
            {[
              { email: "student@mapua.edu.ph", role: "Student Org" },
              { email: "faculty@mapua.edu.ph", role: "Faculty Adviser" },
              { email: "admin@mapua.edu.ph", role: "Administrator" },
              { email: "maintenance@mapua.edu.ph", role: "Maintenance" },
            ].map((c) => (
              <button
                key={c.email}
                onClick={() => { setEmail(c.email); setPassword("demo"); setError(""); }}
                className="w-full text-left text-xs py-1 px-1 hover:bg-gray-200 rounded transition flex justify-between"
              >
                <span className="text-gray-700">{c.email}</span>
                <span className="text-gray-400">{c.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
function ForgotPasswordPage({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: RED }}>
            <span className="font-bold text-white text-sm">CRH</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@mapua.edu.ph"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={onSubmit}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: RED }}
          >
            Send Reset Link
          </button>
          <button onClick={onBack} className="w-full text-sm text-gray-500 hover:text-gray-700 text-center">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordPage({ onBack, onReset }: { onBack: () => void; onReset: () => void }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: RED }}>
            <span className="font-bold text-white text-sm">CRH</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">Set your new password below.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none" />
          </div>
          <button onClick={onReset} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: RED }}>
            Reset Password
          </button>
          <button onClick={onBack} className="w-full text-sm text-gray-500 hover:text-gray-700 text-center">← Back to Login</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const STUDENT_NAV: SidebarItem[] = [
  { label: "Dashboard", page: "student-dashboard", icon: Icons.dashboard },
  { label: "Facilities", page: "student-facilities", icon: Icons.building },
  { label: "Equipment", page: "student-equipment", icon: Icons.equipment },
  { label: "My Requests", page: "student-requests", icon: Icons.clipboard },
  { label: "Approved Bookings", page: "student-approved", icon: Icons.check },
  { label: "Booking History", page: "student-history", icon: Icons.history },
  { label: "Profile", page: "student-profile", icon: Icons.user },
];

function StudentPortal({
  bookings,
  setBookings,
  onLogout,
}: {
  bookings: BookingRequest[];
  setBookings: (b: BookingRequest[]) => void;
  onLogout: () => void;
}) {
  const [page, setPage] = useState("student-dashboard");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [bookingStep, setBookingStep] = useState(0); // 0=form, 1=review, 2=confirm
  const [newBooking, setNewBooking] = useState<Partial<BookingRequest>>({});
  const [prevPage, setPrevPage] = useState("student-dashboard");

  function nav(p: string) {
    setPrevPage(page);
    setPage(p);
  }

  const myBookings = bookings.filter((b) => b.orgName === "Supreme Student Council" || b.orgName === "IT Students Society");
  const pendingCount = myBookings.filter((b) => ["pending", "faculty_review", "admin_review", "maintenance_check", "available"].includes(b.status)).length;
  const approvedCount = myBookings.filter((b) => ["admin_approved", "prepared", "completed"].includes(b.status)).length;

  function renderPage() {
    switch (page) {
      case "student-dashboard":
        return <StudentDashboard bookings={myBookings} nav={nav} />;
      case "student-facilities":
        return (
          <StudentFacilities
            facilities={FACILITIES}
            onSelect={(f) => { setSelectedFacility(f); nav("student-facility-detail"); }}
          />
        );
      case "student-facility-detail":
        return selectedFacility ? (
          <StudentFacilityDetail
            facility={selectedFacility}
            onBack={() => nav("student-facilities")}
            onBook={() => {
              setNewBooking({ facilityId: selectedFacility.id, equipmentItems: [] });
              setBookingStep(0);
              nav("student-booking-create");
            }}
          />
        ) : null;
      case "student-equipment":
        return (
          <StudentEquipment
            equipment={EQUIPMENT}
            onSelect={(e) => { setSelectedEquipment(e); nav("student-equipment-detail"); }}
          />
        );
      case "student-equipment-detail":
        return selectedEquipment ? (
          <StudentEquipmentDetail
            equipment={selectedEquipment}
            onBack={() => nav("student-equipment")}
          />
        ) : null;
      case "student-booking-create":
        return (
          <StudentBookingForm
            step={bookingStep}
            draft={newBooking}
            setDraft={setNewBooking}
            onBack={() => {
              if (bookingStep === 0) nav("student-facilities");
              else setBookingStep(bookingStep - 1);
            }}
            onReview={() => setBookingStep(1)}
            onSubmit={() => {
              const newReq: BookingRequest = {
                id: `BR-2026-00${bookings.length + 1}`,
                orgName: "Supreme Student Council",
                eventName: newBooking.eventName || "New Event",
                eventDescription: newBooking.eventDescription || "",
                date: newBooking.date || "2026-10-01",
                startTime: newBooking.startTime || "08:00",
                endTime: newBooking.endTime || "17:00",
                participants: newBooking.participants || 0,
                facilityId: newBooking.facilityId || "f1",
                equipmentItems: newBooking.equipmentItems || [],
                documents: newBooking.documents || [],
                status: "pending",
                submittedAt: new Date().toLocaleString("en-PH"),
              };
              setBookings([...bookings, newReq]);
              setSelectedBooking(newReq);
              nav("student-request-detail");
            }}
            onCancel={() => nav("student-dashboard")}
          />
        );
      case "student-requests":
        return (
          <StudentRequests
            bookings={myBookings.filter((b) => !["completed"].includes(b.status))}
            onSelect={(b) => { setSelectedBooking(b); nav("student-request-detail"); }}
          />
        );
      case "student-request-detail":
        return selectedBooking ? (
          <StudentRequestDetail
            booking={selectedBooking}
            onBack={() => nav("student-requests")}
          />
        ) : null;
      case "student-approved":
        return (
          <StudentApproved
            bookings={myBookings.filter((b) => ["admin_approved", "prepared", "completed"].includes(b.status))}
            onSelect={(b) => { setSelectedBooking(b); nav("student-request-detail"); }}
          />
        );
      case "student-history":
        return (
          <StudentHistory
            bookings={myBookings}
            onSelect={(b) => { setSelectedBooking(b); nav("student-request-detail"); }}
          />
        );
      case "student-profile":
        return <StudentProfile />;
      default:
        return <StudentDashboard bookings={myBookings} nav={nav} />;
    }
  }

  return (
    <AppLayout
      sidebarItems={STUDENT_NAV}
      currentPage={page}
      onNav={nav}
      onLogout={onLogout}
      userLabel="SSC President"
      roleLabel="Student Organization"
    >
      {renderPage()}
    </AppLayout>
  );
}

function StudentDashboard({ bookings, nav }: { bookings: BookingRequest[]; nav: (p: string) => void }) {
  const pending = bookings.filter((b) => ["pending", "faculty_review", "admin_review", "maintenance_check", "available"].includes(b.status));
  const approved = bookings.filter((b) => ["admin_approved", "prepared"].includes(b.status));
  const upcoming = bookings.filter((b) => b.status !== "completed" && new Date(b.date) >= new Date());

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome back. Here is an overview of your reservations." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Requests" value={pending.length} color="yellow" />
        <StatCard label="Approved Bookings" value={approved.length} color="green" />
        <StatCard label="Upcoming Events" value={upcoming.length} color="blue" />
        <StatCard label="Available Facilities" value={FACILITIES.filter((f) => f.status === "available").length} color="gray" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Requests</h3>
            <button onClick={() => nav("student-requests")} className="text-xs hover:underline" style={{ color: RED }}>View All</button>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.eventName}</p>
                  <p className="text-xs text-gray-400">{b.id} · {formatDate(b.date)}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => nav("student-facilities")}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
            >
              <span style={{ color: RED }}>{Icons.building}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Browse Facilities</p>
                <p className="text-xs text-gray-400">View available venues</p>
              </div>
            </button>
            <button
              onClick={() => nav("student-equipment")}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
            >
              <span style={{ color: RED }}>{Icons.equipment}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Browse Equipment</p>
                <p className="text-xs text-gray-400">Check available equipment</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function StudentFacilities({ facilities, onSelect }: { facilities: Facility[]; onSelect: (f: Facility) => void }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? facilities : facilities.filter((f) => f.status === filter);
  return (
    <>
      <PageHeader title="Available Facilities" subtitle="Browse venues available for booking." />
      <div className="flex gap-2 mb-4">
        {["all", "available", "unavailable"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 text-xs rounded-full border transition font-medium"
            style={
              filter === s
                ? { background: RED, color: "#fff", borderColor: RED }
                : { background: "#fff", color: "#374151", borderColor: "#d1d5db" }
            }
          >
            {s === "all" ? "All" : s === "available" ? "Available" : "Unavailable"}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((f) => (
          <div key={f.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.name}</h3>
                <p className="text-xs text-gray-400">{f.type} · {f.location}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === "available" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {f.status === "available" ? "Available" : "Unavailable"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{f.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Capacity: <strong>{f.capacity}</strong> persons</span>
              <button onClick={() => onSelect(f)} className="text-xs font-medium hover:underline" style={{ color: RED }}>
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StudentFacilityDetail({ facility, onBack, onBook }: { facility: Facility; onBack: () => void; onBook: () => void }) {
  return (
    <>
      <BackButton onClick={onBack} label="Back to Facilities" />
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100" style={{ background: RED_LIGHT }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{facility.name}</h2>
              <p className="text-sm text-gray-500">{facility.type} · {facility.location}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${facility.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {facility.status === "available" ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Capacity</p>
              <p className="text-sm font-semibold text-gray-900">{facility.capacity} persons</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Location</p>
              <p className="text-sm font-semibold text-gray-900">{facility.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Facility Type</p>
              <p className="text-sm font-semibold text-gray-900">{facility.type}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700">{facility.description}</p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex gap-3">
            <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
              Back
            </button>
            {facility.status === "available" && (
              <button onClick={onBook} className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90" style={{ background: RED }}>
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StudentEquipment({ equipment, onSelect }: { equipment: Equipment[]; onSelect: (e: Equipment) => void }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? equipment : equipment.filter((e) => e.status === filter);
  return (
    <>
      <PageHeader title="Available Equipment" subtitle="Browse equipment available for reservations." />
      <div className="flex gap-2 mb-4">
        {["all", "available", "unavailable"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 text-xs rounded-full border transition font-medium"
            style={filter === s ? { background: RED, color: "#fff", borderColor: RED } : { background: "#fff", color: "#374151", borderColor: "#d1d5db" }}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <Table
        headers={["Equipment", "Category", "Total Qty", "Available", "Condition", "Status", ""]}
        rows={filtered.map((e) => [
          <span className="font-medium text-gray-900">{e.name}</span>,
          e.category,
          e.totalQty,
          <span className={e.availableQty === 0 ? "text-red-600 font-medium" : "text-green-700 font-medium"}>{e.availableQty}</span>,
          e.condition,
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${e.status === "available" && e.availableQty > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {e.status === "available" && e.availableQty > 0 ? "Available" : "Unavailable"}
          </span>,
          <button onClick={() => onSelect(e)} className="text-xs font-medium hover:underline" style={{ color: RED }}>Details</button>,
        ])}
      />
    </>
  );
}

function StudentEquipmentDetail({ equipment, onBack }: { equipment: Equipment; onBack: () => void }) {
  return (
    <>
      <BackButton onClick={onBack} label="Back to Equipment" />
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{equipment.name}</h2>
            <p className="text-sm text-gray-500">{equipment.category}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${equipment.availableQty > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {equipment.availableQty > 0 ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Qty</p>
            <p className="text-xl font-bold text-gray-900">{equipment.totalQty}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Available</p>
            <p className="text-xl font-bold text-green-700">{equipment.availableQty}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Condition</p>
            <p className="text-xl font-bold text-gray-900">{equipment.condition}</p>
          </div>
        </div>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
          Back
        </button>
      </div>
    </>
  );
}

function StudentBookingForm({
  step,
  draft,
  setDraft,
  onBack,
  onReview,
  onSubmit,
  onCancel,
}: {
  step: number;
  draft: Partial<BookingRequest>;
  setDraft: (d: Partial<BookingRequest>) => void;
  onBack: () => void;
  onReview: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const [eqId, setEqId] = useState("");
  const [eqQty, setEqQty] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>(draft.documents || []);
  const [conflict, setConflict] = useState(false);

  function addEquipment() {
    if (!eqId) return;
    const existing = (draft.equipmentItems || []).find((e) => e.equipmentId === eqId);
    if (existing) return;
    setDraft({ ...draft, equipmentItems: [...(draft.equipmentItems || []), { equipmentId: eqId, quantity: eqQty }] });
    setEqId("");
    setEqQty(1);
  }

  function removeEquipment(id: string) {
    setDraft({ ...draft, equipmentItems: (draft.equipmentItems || []).filter((e) => e.equipmentId !== id) });
  }

  function checkConflict(date: string, start: string, end: string, facilityId: string) {
    // Simplified conflict check
    setConflict(date === "2026-09-20" && facilityId === "f1");
  }

  if (step === 1) {
    // Review Step
    const facility = getFacility(draft.facilityId || "");
    return (
      <>
        <BackButton onClick={onBack} label="Back to Form" />
        <PageHeader title="Review Request" subtitle="Please review your booking request before submitting." />
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Information</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-400 text-xs">Event Name</dt><dd className="font-medium text-gray-900">{draft.eventName}</dd></div>
              <div><dt className="text-gray-400 text-xs">Date</dt><dd className="font-medium text-gray-900">{draft.date && formatDate(draft.date)}</dd></div>
              <div><dt className="text-gray-400 text-xs">Time</dt><dd className="font-medium text-gray-900">{draft.startTime} – {draft.endTime}</dd></div>
              <div><dt className="text-gray-400 text-xs">Participants</dt><dd className="font-medium text-gray-900">{draft.participants}</dd></div>
              <div className="col-span-2"><dt className="text-gray-400 text-xs">Description</dt><dd className="font-medium text-gray-900">{draft.eventDescription}</dd></div>
            </dl>
          </div>
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Facility</h3>
            {facility && (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-gray-400 text-xs">Venue</dt><dd className="font-medium text-gray-900">{facility.name}</dd></div>
                <div><dt className="text-gray-400 text-xs">Capacity</dt><dd className="font-medium text-gray-900">{facility.capacity} persons</dd></div>
                <div><dt className="text-gray-400 text-xs">Location</dt><dd className="font-medium text-gray-900">{facility.location}</dd></div>
              </dl>
            )}
          </div>
          {(draft.equipmentItems || []).length > 0 && (
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Equipment</h3>
              <div className="space-y-1">
                {(draft.equipmentItems || []).map((item) => {
                  const eq = getEquipment(item.equipmentId);
                  return eq ? (
                    <div key={item.equipmentId} className="flex justify-between text-sm">
                      <span className="text-gray-700">{eq.name}</span>
                      <span className="font-medium">× {item.quantity}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
            {(draft.documents || []).length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {(draft.documents || []).map((d, i) => <li key={i} className="text-gray-700">📄 {d}</li>)}
              </ul>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">← Edit</button>
          <button onClick={onSubmit} className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ background: RED }}>
            Submit Request
          </button>
        </div>
      </>
    );
  }

  // Step 0: Form
  return (
    <>
      <BackButton onClick={onBack} label="Back" />
      <PageHeader title="Create Booking Request" subtitle="Fill in all required information to submit your reservation request." />

      {conflict && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
          <span>⚠️</span>
          <span>Warning: The selected facility already has a booking on this date and time. Please choose a different schedule or venue.</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {/* Event Info */}
        <div className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Event Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Event Name *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={draft.eventName || ""}
                onChange={(e) => setDraft({ ...draft, eventName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Number of Participants *</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={draft.participants || ""}
                onChange={(e) => setDraft({ ...draft, participants: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={draft.date || ""}
                onChange={(e) => {
                  setDraft({ ...draft, date: e.target.value });
                  if (draft.facilityId && draft.startTime && draft.endTime)
                    checkConflict(e.target.value, draft.startTime, draft.endTime, draft.facilityId);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time *</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={draft.startTime || ""}
                  onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Time *</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={draft.endTime || ""}
                  onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Event Description *</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={draft.eventDescription || ""}
                onChange={(e) => setDraft({ ...draft, eventDescription: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Facility */}
        <div className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Facility</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Venue *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={draft.facilityId || ""}
              onChange={(e) => {
                setDraft({ ...draft, facilityId: e.target.value });
                if (draft.date && draft.startTime && draft.endTime)
                  checkConflict(draft.date, draft.startTime, draft.endTime, e.target.value);
              }}
            >
              <option value="">-- Select a facility --</option>
              {FACILITIES.map((f) => (
                <option key={f.id} value={f.id} disabled={f.status === "unavailable"}>
                  {f.name} (Cap: {f.capacity}) {f.status === "unavailable" ? "— Unavailable" : ""}
                </option>
              ))}
            </select>
          </div>
          {draft.facilityId && (() => {
            const f = getFacility(draft.facilityId);
            return f ? (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 grid grid-cols-2 gap-2">
                <span>Capacity: <strong>{f.capacity}</strong></span>
                <span>Location: <strong>{f.location}</strong></span>
              </div>
            ) : null;
          })()}
        </div>

        {/* Equipment */}
        <div className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Equipment (Optional)</h3>
          <div className="flex gap-2">
            <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" value={eqId} onChange={(e) => setEqId(e.target.value)}>
              <option value="">-- Select equipment --</option>
              {EQUIPMENT.filter((e) => e.availableQty > 0).map((e) => (
                <option key={e.id} value={e.id}>{e.name} (Avail: {e.availableQty})</option>
              ))}
            </select>
            <input type="number" min={1} value={eqQty} onChange={(e) => setEqQty(Number(e.target.value))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <button onClick={addEquipment} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: RED }}>Add</button>
          </div>
          {(draft.equipmentItems || []).length > 0 && (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {(draft.equipmentItems || []).map((item) => {
                const eq = getEquipment(item.equipmentId);
                return eq ? (
                  <div key={item.equipmentId} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-700">{eq.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">× {item.quantity}</span>
                      <button onClick={() => removeEquipment(item.equipmentId)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Required Documents</h3>
          <p className="text-xs text-gray-400">Upload required documents (Letter of Intent, Program Flow, etc.)</p>
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => fileRef.current?.click()}
          >
            <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC up to 10MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files || []).map((f) => f.name);
              const updated = [...files, ...newFiles];
              setFiles(updated);
              setDraft({ ...draft, documents: updated });
            }}
          />
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                  <span>📄</span> {f}
                  <button onClick={() => {
                    const updated = files.filter((_, j) => j !== i);
                    setFiles(updated);
                    setDraft({ ...draft, documents: updated });
                  }} className="ml-auto text-red-400 hover:text-red-600 text-xs">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">← Back</button>
        <button
          onClick={onReview}
          disabled={!draft.eventName || !draft.date || !draft.facilityId}
          className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
          style={{ background: RED }}
        >
          Review Request →
        </button>
      </div>
    </>
  );
}

function StudentRequests({ bookings, onSelect }: { bookings: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="My Requests" subtitle="Track the status of your booking requests." />
      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">No active requests.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer" onClick={() => onSelect(b)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.eventName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.id} · {getFacility(b.facilityId)?.name} · {formatDate(b.date)}</p>
                  <p className="text-xs text-gray-400">{b.startTime} – {b.endTime}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <WorkflowTracker status={b.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function WorkflowTracker({ status }: { status: BookingStatus }) {
  const steps = [
    { label: "Submitted", statuses: ["pending"] },
    { label: "Faculty Review", statuses: ["faculty_review", "faculty_approved", "faculty_rejected"] },
    { label: "Admin Review", statuses: ["admin_review", "admin_approved", "admin_rejected"] },
    { label: "Maintenance", statuses: ["maintenance_check", "available", "prepared"] },
    { label: "Completed", statuses: ["completed"] },
  ];

  const currentIndex = steps.findIndex((s) => s.statuses.includes(status));
  const isRejected = status === "faculty_rejected" || status === "admin_rejected";

  return (
    <div className="flex items-center gap-1 text-xs">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const failed = isRejected && active;
        return (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${failed ? "bg-red-500" : done || active ? "" : "bg-gray-200"}`}
              style={done ? { background: "#16a34a" } : active && !failed ? { background: RED } : {}}>
            </div>
            <span className={`${done ? "text-green-700" : active ? (failed ? "text-red-600 font-medium" : "font-medium") : "text-gray-300"}`}
              style={active && !failed ? { color: RED } : {}}>
              {step.label}
            </span>
            {i < steps.length - 1 && <span className="text-gray-200 mx-0.5">›</span>}
          </div>
        );
      })}
    </div>
  );
}

function StudentRequestDetail({ booking, onBack }: { booking: BookingRequest; onBack: () => void }) {
  const facility = getFacility(booking.facilityId);
  return (
    <>
      <BackButton onClick={onBack} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{booking.eventName}</h1>
          <p className="text-sm text-gray-500">{booking.id} · Submitted {booking.submittedAt}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mb-4">
        <WorkflowTracker status={booking.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Information</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-400 text-xs">Organization</dt><dd className="font-medium">{booking.orgName}</dd></div>
            <div><dt className="text-gray-400 text-xs">Date</dt><dd className="font-medium">{formatDate(booking.date)}</dd></div>
            <div><dt className="text-gray-400 text-xs">Time</dt><dd className="font-medium">{booking.startTime} – {booking.endTime}</dd></div>
            <div><dt className="text-gray-400 text-xs">Participants</dt><dd className="font-medium">{booking.participants}</dd></div>
            <div className="col-span-2"><dt className="text-gray-400 text-xs">Description</dt><dd className="font-medium">{booking.eventDescription}</dd></div>
          </dl>
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Facility</h3>
          {facility && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-400 text-xs">Venue</dt><dd className="font-medium">{facility.name}</dd></div>
              <div><dt className="text-gray-400 text-xs">Location</dt><dd className="font-medium">{facility.location}</dd></div>
              <div><dt className="text-gray-400 text-xs">Capacity</dt><dd className="font-medium">{facility.capacity} persons</dd></div>
            </dl>
          )}
        </div>
        {booking.equipmentItems.length > 0 && (
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Equipment</h3>
            <div className="space-y-1">
              {booking.equipmentItems.map((item) => {
                const eq = getEquipment(item.equipmentId);
                return eq ? (
                  <div key={item.equipmentId} className="flex justify-between text-sm">
                    <span>{eq.name}</span><span className="font-medium">× {item.quantity}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
          {booking.documents.length === 0
            ? <p className="text-sm text-gray-400">No documents uploaded.</p>
            : <ul className="space-y-1">{booking.documents.map((d, i) => <li key={i} className="text-sm text-gray-700">📄 {d}</li>)}</ul>}
        </div>
        {(booking.facultyRemarks || booking.adminRemarks) && (
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Remarks</h3>
            {booking.facultyRemarks && (
              <div className="bg-blue-50 border border-blue-100 rounded p-3 text-sm">
                <p className="text-xs font-medium text-blue-700 mb-1">Faculty Adviser</p>
                <p className="text-gray-700">{booking.facultyRemarks}</p>
              </div>
            )}
            {booking.adminRemarks && (
              <div className="bg-green-50 border border-green-100 rounded p-3 text-sm">
                <p className="text-xs font-medium text-green-700 mb-1">Administrator</p>
                <p className="text-gray-700">{booking.adminRemarks}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function StudentApproved({ bookings, onSelect }: { bookings: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Approved Bookings" subtitle="Your confirmed and approved reservations." />
      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">No approved bookings yet.</div>
      ) : (
        <Table
          headers={["Reference", "Event", "Venue", "Date", "Time", "Status", ""]}
          rows={bookings.map((b) => [
            <span className="font-mono text-xs text-gray-500">{b.id}</span>,
            <span className="font-medium text-gray-900">{b.eventName}</span>,
            getFacility(b.facilityId)?.name || "-",
            formatDate(b.date),
            `${b.startTime}–${b.endTime}`,
            <StatusBadge status={b.status} />,
            <button onClick={() => onSelect(b)} className="text-xs font-medium hover:underline" style={{ color: RED }}>View</button>,
          ])}
        />
      )}
    </>
  );
}

function StudentHistory({ bookings, onSelect }: { bookings: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Booking History" subtitle="All your past and current booking requests." />
      <Table
        headers={["Reference", "Event", "Venue", "Date", "Status", ""]}
        rows={bookings.map((b) => [
          <span className="font-mono text-xs text-gray-500">{b.id}</span>,
          <span className="font-medium text-gray-900">{b.eventName}</span>,
          getFacility(b.facilityId)?.name || "-",
          formatDate(b.date),
          <StatusBadge status={b.status} />,
          <button onClick={() => onSelect(b)} className="text-xs font-medium hover:underline" style={{ color: RED }}>View</button>,
        ])}
      />
    </>
  );
}

function StudentProfile() {
  return (
    <>
      <PageHeader title="Profile" subtitle="Your organization account details." />
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: RED }}>S</div>
          <div>
            <h2 className="font-semibold text-gray-900">Supreme Student Council</h2>
            <p className="text-sm text-gray-500">student@mapua.edu.ph</p>
          </div>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <dt className="text-gray-400">Organization Name</dt>
            <dd className="font-medium text-gray-900">Supreme Student Council</dd>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <dt className="text-gray-400">Role</dt>
            <dd className="font-medium text-gray-900">Student Organization</dd>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <dt className="text-gray-400">Campus</dt>
            <dd className="font-medium text-gray-900">Mapúa University – Makati</dd>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <dt className="text-gray-400">Account Status</dt>
            <dd className="font-medium text-green-700">Active</dd>
          </div>
        </dl>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTY PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const FACULTY_NAV: SidebarItem[] = [
  { label: "Dashboard", page: "faculty-dashboard", icon: Icons.dashboard },
  { label: "Pending Requests", page: "faculty-requests", icon: Icons.clipboard },
  { label: "Approval History", page: "faculty-history", icon: Icons.history },
  { label: "Profile", page: "faculty-profile", icon: Icons.user },
];

function FacultyPortal({
  bookings,
  setBookings,
  onLogout,
}: {
  bookings: BookingRequest[];
  setBookings: (b: BookingRequest[]) => void;
  onLogout: () => void;
}) {
  const [page, setPage] = useState("faculty-dashboard");
  const [selected, setSelected] = useState<BookingRequest | null>(null);

  function nav(p: string) { setPage(p); }

  function approve(id: string, remarks: string) {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: "admin_review" as BookingStatus, facultyRemarks: remarks } : b));
    nav("faculty-requests");
  }

  function reject(id: string, remarks: string) {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: "faculty_rejected" as BookingStatus, facultyRemarks: remarks } : b));
    nav("faculty-requests");
  }

  const pending = bookings.filter((b) => b.status === "faculty_review");
  const approved = bookings.filter((b) => !["pending", "faculty_review", "faculty_rejected"].includes(b.status));
  const rejected = bookings.filter((b) => b.status === "faculty_rejected");

  function renderPage() {
    switch (page) {
      case "faculty-dashboard":
        return <FacultyDashboard pending={pending} approved={approved} rejected={rejected} onNav={nav} />;
      case "faculty-requests":
        return (
          <FacultyRequests
            requests={pending}
            onSelect={(b) => { setSelected(b); nav("faculty-request-detail"); }}
          />
        );
      case "faculty-request-detail":
        return selected ? (
          <FacultyRequestDetail
            booking={selected}
            onBack={() => nav("faculty-requests")}
            onApprove={approve}
            onReject={reject}
          />
        ) : null;
      case "faculty-history":
        return (
          <FacultyHistory
            bookings={[...approved, ...rejected]}
            onSelect={(b) => { setSelected(b); nav("faculty-request-detail"); }}
          />
        );
      case "faculty-profile":
        return <FacultyProfile />;
      default:
        return <FacultyDashboard pending={pending} approved={approved} rejected={rejected} onNav={nav} />;
    }
  }

  return (
    <AppLayout sidebarItems={FACULTY_NAV} currentPage={page} onNav={nav} onLogout={onLogout} userLabel="Prof. Santos" roleLabel="Faculty Adviser">
      {renderPage()}
    </AppLayout>
  );
}

function FacultyDashboard({ pending, approved, rejected, onNav }: { pending: BookingRequest[]; approved: BookingRequest[]; rejected: BookingRequest[]; onNav: (p: string) => void }) {
  return (
    <>
      <PageHeader title="Faculty Dashboard" subtitle="Review and approve student organization booking requests." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Approvals" value={pending.length} color="yellow" />
        <StatCard label="Approved" value={approved.length} color="green" />
        <StatCard label="Rejected" value={rejected.length} color="red" />
        <StatCard label="Total Reviewed" value={approved.length + rejected.length} color="gray" />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Pending for Review</h3>
          <button onClick={() => onNav("faculty-requests")} className="text-xs hover:underline" style={{ color: RED }}>View All</button>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.eventName}</p>
                  <p className="text-xs text-gray-400">{b.orgName} · {formatDate(b.date)}</p>
                </div>
                <button onClick={() => onNav("faculty-requests")} className="text-xs font-medium px-3 py-1 rounded border hover:bg-gray-50" style={{ color: RED, borderColor: RED }}>
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FacultyRequests({ requests, onSelect }: { requests: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Pending Requests" subtitle="Review and approve or reject booking requests from student organizations." />
      {requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">No pending requests to review.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer" onClick={() => onSelect(b)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.eventName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.orgName} · {b.id}</p>
                  <p className="text-xs text-gray-400">{getFacility(b.facilityId)?.name} · {formatDate(b.date)} · {b.startTime}–{b.endTime}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={b.status} />
                  <span className="text-xs text-gray-400">{b.documents.length} document(s)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function FacultyRequestDetail({
  booking,
  onBack,
  onApprove,
  onReject,
}: {
  booking: BookingRequest;
  onBack: () => void;
  onApprove: (id: string, r: string) => void;
  onReject: (id: string, r: string) => void;
}) {
  const [remarks, setRemarks] = useState("");
  const [action, setAction] = useState<"" | "approve" | "reject">("");
  const facility = getFacility(booking.facilityId);
  const isPending = booking.status === "faculty_review";

  return (
    <>
      <BackButton onClick={onBack} label="Back to Requests" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{booking.eventName}</h1>
          <p className="text-sm text-gray-500">{booking.id} · {booking.orgName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 mb-4">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Details</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-400 text-xs">Event Name</dt><dd className="font-medium">{booking.eventName}</dd></div>
            <div><dt className="text-gray-400 text-xs">Organization</dt><dd className="font-medium">{booking.orgName}</dd></div>
            <div><dt className="text-gray-400 text-xs">Date</dt><dd className="font-medium">{formatDate(booking.date)}</dd></div>
            <div><dt className="text-gray-400 text-xs">Time</dt><dd className="font-medium">{booking.startTime} – {booking.endTime}</dd></div>
            <div><dt className="text-gray-400 text-xs">Participants</dt><dd className="font-medium">{booking.participants}</dd></div>
            <div><dt className="text-gray-400 text-xs">Venue</dt><dd className="font-medium">{facility?.name}</dd></div>
            <div className="col-span-2"><dt className="text-gray-400 text-xs">Description</dt><dd className="font-medium">{booking.eventDescription}</dd></div>
          </dl>
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Equipment Requested</h3>
          {booking.equipmentItems.length === 0 ? (
            <p className="text-sm text-gray-400">No equipment requested.</p>
          ) : (
            <div className="space-y-1">
              {booking.equipmentItems.map((item) => {
                const eq = getEquipment(item.equipmentId);
                return eq ? <div key={item.equipmentId} className="flex justify-between text-sm"><span>{eq.name}</span><span>× {item.quantity}</span></div> : null;
              })}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
          {booking.documents.length === 0 ? (
            <p className="text-sm text-gray-400">No documents.</p>
          ) : (
            <ul className="space-y-1">
              {booking.documents.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                  <span>📄</span> {d}
                  <button className="ml-auto text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-100">View</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isPending && (
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Your Remarks</h3>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Add remarks or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setAction("reject"); onReject(booking.id, remarks || "Rejected by Faculty Adviser."); }}
                className="px-5 py-2 rounded-lg text-sm font-semibold border-2 border-red-600 text-red-600 hover:bg-red-50 transition"
              >
                Reject Request
              </button>
              <button
                onClick={() => { setAction("approve"); onApprove(booking.id, remarks || "Approved by Faculty Adviser."); }}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition"
                style={{ background: "#16a34a" }}
              >
                Approve Request
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function FacultyHistory({ bookings, onSelect }: { bookings: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Approval History" subtitle="All requests you have reviewed." />
      <Table
        headers={["Reference", "Event", "Organization", "Date", "Status", ""]}
        rows={bookings.map((b) => [
          <span className="font-mono text-xs text-gray-500">{b.id}</span>,
          <span className="font-medium text-gray-900">{b.eventName}</span>,
          b.orgName,
          formatDate(b.date),
          <StatusBadge status={b.status} />,
          <button onClick={() => onSelect(b)} className="text-xs font-medium hover:underline" style={{ color: RED }}>View</button>,
        ])}
      />
    </>
  );
}

function FacultyProfile() {
  return (
    <>
      <PageHeader title="Profile" />
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: RED }}>P</div>
          <div>
            <h2 className="font-semibold text-gray-900">Prof. Maria Santos</h2>
            <p className="text-sm text-gray-500">faculty@mapua.edu.ph</p>
          </div>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2"><dt className="text-gray-400">Role</dt><dd className="font-medium">Faculty Adviser</dd></div>
          <div className="grid grid-cols-2 gap-2"><dt className="text-gray-400">Department</dt><dd className="font-medium">School of Information Technology</dd></div>
          <div className="grid grid-cols-2 gap-2"><dt className="text-gray-400">Campus</dt><dd className="font-medium">Mapúa University – Makati</dd></div>
        </dl>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const ADMIN_NAV: SidebarItem[] = [
  { label: "Dashboard", page: "admin-dashboard", icon: Icons.dashboard },
  { label: "Booking Requests", page: "admin-requests", icon: Icons.clipboard },
  { label: "Facility Management", page: "admin-facilities", icon: Icons.building },
  { label: "Equipment Management", page: "admin-equipment", icon: Icons.equipment },
  { label: "Approved Bookings", page: "admin-approved", icon: Icons.check },
  { label: "Booking Records", page: "admin-records", icon: Icons.history },
];

function AdminPortal({
  bookings,
  setBookings,
  onLogout,
}: {
  bookings: BookingRequest[];
  setBookings: (b: BookingRequest[]) => void;
  onLogout: () => void;
}) {
  const [page, setPage] = useState("admin-dashboard");
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>(FACILITIES);
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);

  function nav(p: string) { setPage(p); }

  function adminApprove(id: string, remarks: string) {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: "maintenance_check" as BookingStatus, adminRemarks: remarks } : b));
    nav("admin-requests");
  }

  function adminReject(id: string, remarks: string) {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: "admin_rejected" as BookingStatus, adminRemarks: remarks } : b));
    nav("admin-requests");
  }

  const pendingAdmin = bookings.filter((b) => b.status === "admin_review");
  const approved = bookings.filter((b) => ["maintenance_check", "available", "prepared", "completed"].includes(b.status));

  function renderPage() {
    switch (page) {
      case "admin-dashboard":
        return <AdminDashboard bookings={bookings} facilities={facilities} equipment={equipment} onNav={nav} />;
      case "admin-requests":
        return (
          <AdminRequests
            requests={pendingAdmin}
            onSelect={(b) => { setSelected(b); nav("admin-request-detail"); }}
          />
        );
      case "admin-request-detail":
        return selected ? (
          <AdminRequestDetail
            booking={selected}
            onBack={() => nav("admin-requests")}
            onApprove={adminApprove}
            onReject={adminReject}
          />
        ) : null;
      case "admin-facilities":
        return <AdminFacilities facilities={facilities} setFacilities={setFacilities} />;
      case "admin-equipment":
        return <AdminEquipment equipment={equipment} setEquipment={setEquipment} />;
      case "admin-approved":
        return (
          <AdminApproved
            bookings={approved}
            onSelect={(b) => { setSelected(b); nav("admin-request-detail"); }}
          />
        );
      case "admin-records":
        return (
          <AdminRecords
            bookings={bookings}
            onSelect={(b) => { setSelected(b); nav("admin-request-detail"); }}
          />
        );
      default:
        return <AdminDashboard bookings={bookings} facilities={facilities} equipment={equipment} onNav={nav} />;
    }
  }

  return (
    <AppLayout sidebarItems={ADMIN_NAV} currentPage={page} onNav={nav} onLogout={onLogout} userLabel="Admin Reyes" roleLabel="School Administrator">
      {renderPage()}
    </AppLayout>
  );
}

function AdminDashboard({ bookings, facilities, equipment, onNav }: { bookings: BookingRequest[]; facilities: Facility[]; equipment: Equipment[]; onNav: (p: string) => void }) {
  const pending = bookings.filter((b) => b.status === "admin_review").length;
  const approved = bookings.filter((b) => ["maintenance_check", "available", "prepared", "completed"].includes(b.status)).length;
  const availFacilities = facilities.filter((f) => f.status === "available").length;
  const availEquipment = equipment.filter((e) => e.availableQty > 0).length;

  return (
    <>
      <PageHeader title="Administrator Dashboard" subtitle="Manage facilities, equipment, and booking requests." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Requests" value={pending} color="yellow" />
        <StatCard label="Approved Bookings" value={approved} color="green" />
        <StatCard label="Available Facilities" value={availFacilities} color="blue" />
        <StatCard label="Equipment Available" value={availEquipment} color="gray" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Pending for Admin Review</h3>
            <button onClick={() => onNav("admin-requests")} className="text-xs hover:underline" style={{ color: RED }}>View All</button>
          </div>
          {bookings.filter((b) => b.status === "admin_review").slice(0, 4).map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{b.eventName}</p>
                <p className="text-xs text-gray-400">{b.orgName} · {formatDate(b.date)}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {bookings.filter((b) => b.status === "admin_review").length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">No pending requests.</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Facility Availability</h3>
          <div className="space-y-2">
            {facilities.slice(0, 4).map((f) => (
              <div key={f.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{f.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${f.status === "available" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {f.status === "available" ? "Available" : "Unavailable"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AdminRequests({ requests, onSelect }: { requests: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Booking Requests" subtitle="Review faculty-approved requests." />
      {requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">No requests pending admin review.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer" onClick={() => onSelect(b)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.eventName}</p>
                  <p className="text-xs text-gray-500">{b.orgName} · {b.id}</p>
                  <p className="text-xs text-gray-400">{getFacility(b.facilityId)?.name} · {formatDate(b.date)}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.facultyRemarks && (
                <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded">Faculty: {b.facultyRemarks}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminRequestDetail({
  booking,
  onBack,
  onApprove,
  onReject,
}: {
  booking: BookingRequest;
  onBack: () => void;
  onApprove: (id: string, r: string) => void;
  onReject: (id: string, r: string) => void;
}) {
  const [remarks, setRemarks] = useState("");
  const facility = getFacility(booking.facilityId);
  const canAct = booking.status === "admin_review";

  return (
    <>
      <BackButton onClick={onBack} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{booking.eventName}</h1>
          <p className="text-sm text-gray-500">{booking.id} · {booking.orgName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 mb-4">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Event & Booking Details</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-400 text-xs">Organization</dt><dd className="font-medium">{booking.orgName}</dd></div>
            <div><dt className="text-gray-400 text-xs">Date</dt><dd className="font-medium">{formatDate(booking.date)}</dd></div>
            <div><dt className="text-gray-400 text-xs">Time</dt><dd className="font-medium">{booking.startTime} – {booking.endTime}</dd></div>
            <div><dt className="text-gray-400 text-xs">Participants</dt><dd className="font-medium">{booking.participants}</dd></div>
            <div><dt className="text-gray-400 text-xs">Venue</dt><dd className="font-medium">{facility?.name}</dd></div>
            <div><dt className="text-gray-400 text-xs">Venue Capacity</dt><dd className="font-medium">{facility?.capacity}</dd></div>
            <div className="col-span-2"><dt className="text-gray-400 text-xs">Description</dt><dd className="font-medium">{booking.eventDescription}</dd></div>
          </dl>
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Equipment</h3>
          {booking.equipmentItems.length === 0 ? (
            <p className="text-sm text-gray-400">None</p>
          ) : (
            <div className="space-y-1">
              {booking.equipmentItems.map((item) => {
                const eq = getEquipment(item.equipmentId);
                return eq ? <div key={item.equipmentId} className="flex justify-between text-sm"><span>{eq.name}</span><span>× {item.quantity}</span></div> : null;
              })}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
          {booking.documents.length === 0 ? <p className="text-sm text-gray-400">None</p> : (
            <ul className="space-y-1">
              {booking.documents.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                  <span>📄</span> {d}
                  <button className="ml-auto text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-100">View</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {booking.facultyRemarks && (
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Faculty Remarks</h3>
            <div className="bg-blue-50 border border-blue-100 rounded p-3 text-sm text-gray-700">{booking.facultyRemarks}</div>
          </div>
        )}
        {canAct && (
          <div className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Admin Remarks</h3>
            <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Add remarks..."
              value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => onReject(booking.id, remarks || "Rejected by Administrator.")}
                className="px-5 py-2 rounded-lg text-sm font-semibold border-2 border-red-600 text-red-600 hover:bg-red-50 transition">
                Reject Request
              </button>
              <button onClick={() => onApprove(booking.id, remarks || "Approved by Administrator.")}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition" style={{ background: "#16a34a" }}>
                Approve & Forward to Maintenance
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function AdminFacilities({ facilities, setFacilities }: { facilities: Facility[]; setFacilities: (f: Facility[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Facility>>({});

  function saveAdd() {
    const newF: Facility = {
      id: `f${Date.now()}`,
      name: form.name || "",
      capacity: form.capacity || 0,
      location: form.location || "",
      type: form.type || "",
      status: "available",
      description: form.description || "",
    };
    setFacilities([...facilities, newF]);
    setShowAdd(false);
    setForm({});
  }

  function saveEdit() {
    setFacilities(facilities.map((f) => f.id === editId ? { ...f, ...form } : f));
    setEditId(null);
    setForm({});
  }

  function deleteFacility(id: string) {
    setFacilities(facilities.filter((f) => f.id !== id));
  }

  function toggleStatus(id: string) {
    setFacilities(facilities.map((f) => f.id === id ? { ...f, status: f.status === "available" ? "unavailable" : "available" } : f));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Facility Management" subtitle="Add, edit, or remove facilities." />
        <button
          onClick={() => { setShowAdd(true); setForm({}); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: RED }}
        >
          {Icons.plus} Add Facility
        </button>
      </div>

      {(showAdd || editId) && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">{showAdd ? "Add New Facility" : "Edit Facility"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Facility Name</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.capacity || ""} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowAdd(false); setEditId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={showAdd ? saveAdd : saveEdit} className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: RED }}>Save</button>
          </div>
        </div>
      )}

      <Table
        headers={["Facility", "Type", "Location", "Capacity", "Status", "Actions"]}
        rows={facilities.map((f) => [
          <span className="font-medium text-gray-900">{f.name}</span>,
          f.type,
          f.location,
          f.capacity,
          <button onClick={() => toggleStatus(f.id)} className={`text-xs px-2 py-0.5 rounded font-medium cursor-pointer border ${f.status === "available" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {f.status === "available" ? "Available" : "Unavailable"}
          </button>,
          <div className="flex gap-2">
            <button onClick={() => { setEditId(f.id); setForm(f); setShowAdd(false); }} className="text-xs text-blue-600 hover:underline">Edit</button>
            <button onClick={() => deleteFacility(f.id)} className="text-xs text-red-600 hover:underline">Delete</button>
          </div>,
        ])}
      />
    </>
  );
}

function AdminEquipment({ equipment, setEquipment }: { equipment: Equipment[]; setEquipment: (e: Equipment[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Equipment>>({});

  function saveAdd() {
    const newE: Equipment = {
      id: `e${Date.now()}`,
      name: form.name || "",
      totalQty: form.totalQty || 0,
      availableQty: form.availableQty || 0,
      category: form.category || "",
      condition: form.condition || "Good",
      status: "available",
    };
    setEquipment([...equipment, newE]);
    setShowAdd(false);
    setForm({});
  }

  function saveEdit() {
    setEquipment(equipment.map((e) => e.id === editId ? { ...e, ...form } : e));
    setEditId(null);
    setForm({});
  }

  function deleteEquipment(id: string) {
    setEquipment(equipment.filter((e) => e.id !== id));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Equipment Management" subtitle="Manage equipment inventory." />
        <button onClick={() => { setShowAdd(true); setForm({}); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: RED }}>
          {Icons.plus} Add Equipment
        </button>
      </div>

      {(showAdd || editId) && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">{showAdd ? "Add Equipment" : "Edit Equipment"}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Equipment Name</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.condition || "Good"} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option>Good</option><option>Fair</option><option>For Repair</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Qty</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.totalQty || ""} onChange={(e) => setForm({ ...form, totalQty: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Available Qty</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.availableQty || ""} onChange={(e) => setForm({ ...form, availableQty: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowAdd(false); setEditId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={showAdd ? saveAdd : saveEdit} className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: RED }}>Save</button>
          </div>
        </div>
      )}

      <Table
        headers={["Equipment", "Category", "Total", "Available", "Condition", "Status", "Actions"]}
        rows={equipment.map((e) => [
          <span className="font-medium text-gray-900">{e.name}</span>,
          e.category,
          e.totalQty,
          <span className={e.availableQty === 0 ? "text-red-600 font-medium" : "text-green-700 font-medium"}>{e.availableQty}</span>,
          e.condition,
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${e.availableQty > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {e.availableQty > 0 ? "Available" : "Out of Stock"}
          </span>,
          <div className="flex gap-2">
            <button onClick={() => { setEditId(e.id); setForm(e); setShowAdd(false); }} className="text-xs text-blue-600 hover:underline">Edit</button>
            <button onClick={() => deleteEquipment(e.id)} className="text-xs text-red-600 hover:underline">Delete</button>
          </div>,
        ])}
      />
    </>
  );
}

function AdminApproved({ bookings, onSelect }: { bookings: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Approved Bookings" subtitle="Bookings approved and forwarded to maintenance." />
      <Table
        headers={["Reference", "Event", "Organization", "Venue", "Date", "Status", ""]}
        rows={bookings.map((b) => [
          <span className="font-mono text-xs text-gray-500">{b.id}</span>,
          <span className="font-medium text-gray-900">{b.eventName}</span>,
          b.orgName,
          getFacility(b.facilityId)?.name || "-",
          formatDate(b.date),
          <StatusBadge status={b.status} />,
          <button onClick={() => onSelect(b)} className="text-xs font-medium hover:underline" style={{ color: RED }}>View</button>,
        ])}
      />
    </>
  );
}

function AdminRecords({ bookings, onSelect }: { bookings: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="All Booking Records" subtitle="Complete record of all booking requests." />
      <Table
        headers={["Reference", "Event", "Organization", "Date", "Submitted", "Status", ""]}
        rows={bookings.map((b) => [
          <span className="font-mono text-xs text-gray-500">{b.id}</span>,
          <span className="font-medium text-gray-900">{b.eventName}</span>,
          b.orgName,
          formatDate(b.date),
          <span className="text-xs text-gray-500">{b.submittedAt}</span>,
          <StatusBadge status={b.status} />,
          <button onClick={() => onSelect(b)} className="text-xs font-medium hover:underline" style={{ color: RED }}>View</button>,
        ])}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const MAINTENANCE_NAV: SidebarItem[] = [
  { label: "Dashboard", page: "maint-dashboard", icon: Icons.dashboard },
  { label: "Equipment Requests", page: "maint-requests", icon: Icons.clipboard },
  { label: "Completed", page: "maint-completed", icon: Icons.check },
  { label: "Profile", page: "maint-profile", icon: Icons.user },
];

function MaintenancePortal({
  bookings,
  setBookings,
  onLogout,
}: {
  bookings: BookingRequest[];
  setBookings: (b: BookingRequest[]) => void;
  onLogout: () => void;
}) {
  const [page, setPage] = useState("maint-dashboard");
  const [selected, setSelected] = useState<BookingRequest | null>(null);

  function nav(p: string) { setPage(p); }

  const activeRequests = bookings.filter((b) =>
    ["maintenance_check", "available", "prepared"].includes(b.status)
  );
  const completed = bookings.filter((b) => b.status === "completed");

  function updateStatus(id: string, status: BookingStatus) {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b));
  }

  function renderPage() {
    switch (page) {
      case "maint-dashboard":
        return <MaintenanceDashboard requests={activeRequests} completed={completed} onNav={nav} />;
      case "maint-requests":
        return (
          <MaintenanceRequests
            requests={activeRequests}
            onSelect={(b) => { setSelected(b); nav("maint-request-detail"); }}
          />
        );
      case "maint-request-detail":
        return selected ? (
          <MaintenanceRequestDetail
            booking={selected}
            onBack={() => nav("maint-requests")}
            onUpdateStatus={updateStatus}
          />
        ) : null;
      case "maint-completed":
        return (
          <MaintenanceCompleted
            completed={completed}
            onSelect={(b) => { setSelected(b); nav("maint-request-detail"); }}
          />
        );
      case "maint-profile":
        return <MaintenanceProfile />;
      default:
        return <MaintenanceDashboard requests={activeRequests} completed={completed} onNav={nav} />;
    }
  }

  return (
    <AppLayout sidebarItems={MAINTENANCE_NAV} currentPage={page} onNav={nav} onLogout={onLogout} userLabel="Juan dela Cruz" roleLabel="Maintenance Staff">
      {renderPage()}
    </AppLayout>
  );
}

function MaintenanceDashboard({ requests, completed, onNav }: { requests: BookingRequest[]; completed: BookingRequest[]; onNav: (p: string) => void }) {
  const forCheck = requests.filter((b) => b.status === "maintenance_check").length;
  const available = requests.filter((b) => b.status === "available").length;
  const prepared = requests.filter((b) => b.status === "prepared").length;

  return (
    <>
      <PageHeader title="Maintenance Dashboard" subtitle="Manage equipment preparation for approved events." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="For Checking" value={forCheck} color="yellow" />
        <StatCard label="Available" value={available} color="blue" />
        <StatCard label="Prepared" value={prepared} color="green" />
        <StatCard label="Completed" value={completed.length} color="gray" />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Active Equipment Requests</h3>
          <button onClick={() => onNav("maint-requests")} className="text-xs hover:underline" style={{ color: RED }}>View All</button>
        </div>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No active requests.</p>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.eventName}</p>
                  <p className="text-xs text-gray-400">{b.orgName} · {getFacility(b.facilityId)?.name} · {formatDate(b.date)}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MaintenanceRequests({ requests, onSelect }: { requests: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Equipment Requests" subtitle="Check and prepare equipment for approved events." />
      {requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">No active equipment requests.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer" onClick={() => onSelect(b)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.eventName}</p>
                  <p className="text-xs text-gray-500">{b.orgName} · {b.id}</p>
                  <p className="text-xs text-gray-400">{getFacility(b.facilityId)?.name} · {formatDate(b.date)} · {b.startTime}–{b.endTime}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Equipment: {b.equipmentItems.map((item) => {
                  const eq = getEquipment(item.equipmentId);
                  return eq ? `${eq.name} ×${item.quantity}` : "";
                }).filter(Boolean).join(", ") || "None"}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MaintenanceRequestDetail({
  booking,
  onBack,
  onUpdateStatus,
}: {
  booking: BookingRequest;
  onBack: () => void;
  onUpdateStatus: (id: string, s: BookingStatus) => void;
}) {
  const facility = getFacility(booking.facilityId);
  const statusFlow: { status: BookingStatus; label: string; nextLabel: string; nextStatus: BookingStatus }[] = [
    { status: "maintenance_check", label: "For Checking", nextLabel: "Mark as Available", nextStatus: "available" },
    { status: "available", label: "Available", nextLabel: "Mark as Prepared", nextStatus: "prepared" },
    { status: "prepared", label: "Prepared", nextLabel: "Mark as Completed", nextStatus: "completed" },
  ];
  const currentFlow = statusFlow.find((s) => s.status === booking.status);

  return (
    <>
      <BackButton onClick={onBack} label="Back to Requests" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{booking.eventName}</h1>
          <p className="text-sm text-gray-500">{booking.id} · {booking.orgName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Status pipeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Preparation Status</h3>
        <div className="flex items-center gap-1 text-xs">
          {(["maintenance_check", "available", "prepared", "completed"] as BookingStatus[]).map((s, i, arr) => {
            const done = arr.indexOf(booking.status) > i;
            const active = booking.status === s;
            return (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${done ? "bg-green-500" : active ? "" : "bg-gray-200"}`}
                  style={active ? { background: RED } : {}} />
                <span className={`font-medium ${done ? "text-green-600" : active ? "" : "text-gray-300"}`}
                  style={active ? { color: RED } : {}}>
                  {statusLabel(s)}
                </span>
                {i < arr.length - 1 && <span className="text-gray-200 mx-1">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 mb-4">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Event & Venue Details</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-400 text-xs">Event</dt><dd className="font-medium">{booking.eventName}</dd></div>
            <div><dt className="text-gray-400 text-xs">Organization</dt><dd className="font-medium">{booking.orgName}</dd></div>
            <div><dt className="text-gray-400 text-xs">Date</dt><dd className="font-medium">{formatDate(booking.date)}</dd></div>
            <div><dt className="text-gray-400 text-xs">Time</dt><dd className="font-medium">{booking.startTime} – {booking.endTime}</dd></div>
            <div><dt className="text-gray-400 text-xs">Venue</dt><dd className="font-medium">{facility?.name}</dd></div>
            <div><dt className="text-gray-400 text-xs">Location</dt><dd className="font-medium">{facility?.location}</dd></div>
          </dl>
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Equipment to Prepare</h3>
          {booking.equipmentItems.length === 0 ? (
            <p className="text-sm text-gray-400">No equipment requested.</p>
          ) : (
            <div className="space-y-2">
              {booking.equipmentItems.map((item) => {
                const eq = getEquipment(item.equipmentId);
                return eq ? (
                  <div key={item.equipmentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{eq.name}</p>
                      <p className="text-xs text-gray-400">{eq.category} · {eq.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">×{item.quantity}</p>
                      <p className="text-xs text-gray-400">Avail: {eq.availableQty}</p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {currentFlow && (
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Back</button>
          <button
            onClick={() => { onUpdateStatus(booking.id, currentFlow.nextStatus); onBack(); }}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
            style={{ background: "#16a34a" }}
          >
            {currentFlow.nextLabel}
          </button>
        </div>
      )}
    </>
  );
}

function MaintenanceCompleted({ completed, onSelect }: { completed: BookingRequest[]; onSelect: (b: BookingRequest) => void }) {
  return (
    <>
      <PageHeader title="Completed Requests" subtitle="Successfully prepared and completed equipment requests." />
      {completed.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">No completed requests yet.</div>
      ) : (
        <Table
          headers={["Reference", "Event", "Organization", "Venue", "Date", ""]}
          rows={completed.map((b) => [
            <span className="font-mono text-xs text-gray-500">{b.id}</span>,
            <span className="font-medium text-gray-900">{b.eventName}</span>,
            b.orgName,
            getFacility(b.facilityId)?.name || "-",
            formatDate(b.date),
            <button onClick={() => onSelect(b)} className="text-xs font-medium hover:underline" style={{ color: RED }}>View</button>,
          ])}
        />
      )}
    </>
  );
}

function MaintenanceProfile() {
  return (
    <>
      <PageHeader title="Profile" />
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: RED }}>J</div>
          <div>
            <h2 className="font-semibold text-gray-900">Juan dela Cruz</h2>
            <p className="text-sm text-gray-500">maintenance@mapua.edu.ph</p>
          </div>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2"><dt className="text-gray-400">Role</dt><dd className="font-medium">Facilities / Maintenance Staff</dd></div>
          <div className="grid grid-cols-2 gap-2"><dt className="text-gray-400">Department</dt><dd className="font-medium">Facilities Management Office</dd></div>
          <div className="grid grid-cols-2 gap-2"><dt className="text-gray-400">Campus</dt><dd className="font-medium">Mapúa University – Makati</dd></div>
        </dl>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
type Screen = "login" | "forgot" | "reset" | "app";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>(BOOKINGS_INIT);

  function handleLogin(r: Role) {
    setRole(r);
    setScreen("app");
  }

  function handleLogout() {
    setRole(null);
    setScreen("login");
  }

  if (screen === "login") {
    return <LoginPage onLogin={handleLogin} onForgot={() => setScreen("forgot")} />;
  }
  if (screen === "forgot") {
    return <ForgotPasswordPage onBack={() => setScreen("login")} onSubmit={() => setScreen("reset")} />;
  }
  if (screen === "reset") {
    return <ResetPasswordPage onBack={() => setScreen("login")} onReset={() => setScreen("login")} />;
  }

  if (role === "student") {
    return <StudentPortal bookings={bookings} setBookings={setBookings} onLogout={handleLogout} />;
  }
  if (role === "faculty") {
    return <FacultyPortal bookings={bookings} setBookings={setBookings} onLogout={handleLogout} />;
  }
  if (role === "admin") {
    return <AdminPortal bookings={bookings} setBookings={setBookings} onLogout={handleLogout} />;
  }
  if (role === "maintenance") {
    return <MaintenancePortal bookings={bookings} setBookings={setBookings} onLogout={handleLogout} />;
  }

  return null;
}
