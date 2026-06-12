// AJ Square uses a PHP/MySQL API when available, with localStorage fallback for direct file preview.
const STORAGE_KEY = "ajSquareCampusDatabaseV2";
const SQL_API_URL = "api.php";
const DEFAULT_EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
];

const DEFAULT_AVATARS = {
  admin: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  organizer: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  student: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  faculty: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
};

const seedState = window.AJ_SQUARE_DATABASE || {
  users: [
    { id: 1, name: "Dr. Meera Rao", role: "admin", email: "meera.rao@college.edu", department: "Administration", phone: "+91 98765 12001", bio: "Leads campus operations and event governance.", avatar: DEFAULT_AVATARS.admin },
    { id: 2, name: "Arjun Mehta", role: "organizer", email: "arjun.mehta@college.edu", department: "Student Council", phone: "+91 98765 12002", bio: "Creates high-energy campus programs and student experiences.", avatar: DEFAULT_AVATARS.organizer },
    { id: 3, name: "Nisha Patel", role: "student", email: "nisha.patel@college.edu", department: "Computer Science", phone: "+91 98765 12003", bio: "Enjoys hackathons, design clubs, and cultural events.", avatar: DEFAULT_AVATARS.student },
    { id: 4, name: "Prof. Kabir Sen", role: "faculty", email: "kabir.sen@college.edu", department: "Research and Innovation", phone: "+91 98765 12004", bio: "Mentors student teams and reviews academic events.", avatar: DEFAULT_AVATARS.faculty },
    { id: 5, name: "Tara Iyer", role: "student", email: "tara.iyer@college.edu", department: "Electronics", phone: "+91 98765 12005", bio: "Active in research expos and entrepreneurship cells.", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" }
  ],
  events: [
    {
      id: 101,
      name: "Innovation Sprint",
      date: "2026-05-12",
      time: "10:00",
      venue: "Incubation Lab",
      description: "A one-day ideation sprint for student startup concepts.",
      status: "approved",
      organizer: "Arjun Mehta",
      image: DEFAULT_EVENT_IMAGES[3],
      participants: ["Nisha Patel"],
      announcements: ["Bring your laptop and a rough problem statement."]
    },
    {
      id: 102,
      name: "Cultural Night",
      date: "2026-05-18",
      time: "17:30",
      venue: "Open Amphitheatre",
      description: "Music, dance, theatre, and campus club performances.",
      status: "pending",
      organizer: "Arjun Mehta",
      image: DEFAULT_EVENT_IMAGES[2],
      participants: [],
      announcements: []
    },
    {
      id: 103,
      name: "Research Poster Expo",
      date: "2026-05-24",
      time: "14:00",
      venue: "Main Seminar Hall",
      description: "Faculty-guided poster presentations from final-year students.",
      status: "approved",
      organizer: "Science Forum",
      image: DEFAULT_EVENT_IMAGES[1],
      participants: ["Tara Iyer"],
      announcements: ["Poster boards will be provided at the venue."]
    }
  ],
  activities: [
    "Innovation Sprint was approved by Faculty.",
    "Nisha Patel registered for Innovation Sprint.",
    "Cultural Night was submitted for approval."
  ],
  notifications: {
    "Nisha Patel": ["You are registered for Innovation Sprint.", "Research Poster Expo is open for registration."],
    "Tara Iyer": ["You are registered for Research Poster Expo."]
  }
};

let state = loadState();
hydrateState();
let currentUser = null;
let currentSection = "overview";
let sqlDatabaseEnabled = false;

const roleLabels = {
  admin: "Admin",
  organizer: "Event Organizer",
  student: "Student",
  faculty: "Faculty/Staff"
};

const navByRole = {
  admin: [
    ["overview", "Dashboard"],
    ["users", "Users"],
    ["approvals", "Event Approvals"],
    ["activities", "Activities"],
    ["reports", "Reports"],
    ["profile", "My Profile"]
  ],
  organizer: [
    ["overview", "My Dashboard"],
    ["manage-events", "Manage Events"],
    ["participants", "Participants"],
    ["announcements", "Announcements"],
    ["profile", "My Profile"]
  ],
  student: [
    ["overview", "Event Feed"],
    ["available-events", "Available Events"],
    ["registered-events", "My Events"],
    ["notifications", "Notifications"],
    ["profile", "My Profile"]
  ],
  faculty: [
    ["overview", "Faculty Dashboard"],
    ["pending-events", "Pending Events"],
    ["monitor", "Event Monitor"],
    ["profile", "My Profile"]
  ]
};

const loginView = document.querySelector("#login-view");
const appView = document.querySelector("#app-view");
const content = document.querySelector("#dashboard-content");
const sideNav = document.querySelector("#side-nav");
const toast = document.querySelector("#toast");

document.addEventListener("DOMContentLoaded", async () => {
  await initializeDataSource();
  updateLoginStats();
  bindLogin();
  bindGlobalActions();
});

async function initializeDataSource() {
  try {
    const response = await fetch(`${SQL_API_URL}?action=state`, { cache: "no-store" });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "SQL API unavailable.");
    }

    state = result.data;
    hydrateState();
    sqlDatabaseEnabled = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    sqlDatabaseEnabled = false;
    hydrateState();
  }
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(seedState);
}

function hydrateState() {
  state.users = state.users.map((user) => ({
    department: "General",
    phone: "",
    bio: "Campus community member.",
    avatar: DEFAULT_AVATARS[user.role],
    ...user
  }));

  state.events = state.events.map((event, index) => ({
    image: DEFAULT_EVENT_IMAGES[index % DEFAULT_EVENT_IMAGES.length],
    category: "General",
    capacity: 100,
    approvedBy: "",
    attendance: {},
    ...event
  }));

  state.events.forEach((event) => {
    if (!event.attendance) event.attendance = {};
    event.participants.forEach((participant) => {
      if (!event.attendance[participant]) event.attendance[participant] = "registered";
    });
  });

  if (!state.auditTrail) state.auditTrail = [];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateLoginStats();
  persistStateToSql();
}

async function persistStateToSql() {
  if (!sqlDatabaseEnabled) return;

  try {
    const response = await fetch(`${SQL_API_URL}?action=saveState`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "SQL save failed.");
  } catch (error) {
    sqlDatabaseEnabled = false;
    showToast("SQL save failed. Using browser storage fallback.", "error");
  }
}

function bindLogin() {
  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#login-name").value.trim();
    const role = document.querySelector("#login-role").value;

    if (name.length < 2 || !role) {
      showToast("Please enter your name and choose a role.", "error");
      return;
    }

    currentUser = ensureUser(name, role);
    currentSection = "overview";
    showApp();
  });

  document.querySelectorAll("[data-demo-name]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#login-name").value = button.dataset.demoName;
      document.querySelector("#login-role").value = button.dataset.demoRole;
    });
  });
}

function bindGlobalActions() {
  document.querySelector("#logout-btn").addEventListener("click", () => {
    currentUser = null;
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
    showToast("Logged out successfully.", "success");
  });

  document.querySelector("#reset-data-btn").addEventListener("click", () => {
    state = structuredClone(seedState);
    saveState();
    renderCurrentSection();
    showToast("Sample data has been restored.", "success");
  });

  document.querySelector("#menu-toggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
  });
}

function ensureUser(name, role) {
  const existing = state.users.find((user) => user.name.toLowerCase() === name.toLowerCase() && user.role === role);
  if (existing) return existing;

  const user = {
    id: Date.now(),
    name,
    role,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@college.edu`,
    department: "General",
    phone: "",
    bio: "Campus community member.",
    avatar: DEFAULT_AVATARS[role]
  };
  state.users.push(user);
  addActivity(`${name} joined as ${roleLabels[role]}.`);
  saveState();
  return user;
}

function showApp() {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  updateProfileShell();
  renderNav();
  renderCurrentSection();
}

function updateProfileShell() {
  document.querySelector("#profile-name").textContent = currentUser.name;
  document.querySelector("#profile-role").textContent = roleLabels[currentUser.role];
  document.querySelector("#profile-avatar").innerHTML = currentUser.avatar
    ? `<img src="${currentUser.avatar}" alt="${currentUser.name} profile photo">`
    : currentUser.name.charAt(0).toUpperCase();
}

function renderNav() {
  sideNav.innerHTML = navByRole[currentUser.role].map(([key, label]) => `
    <button class="nav-btn ${key === currentSection ? "active" : ""}" type="button" data-section="${key}">
      ${label}
    </button>
  `).join("");

  sideNav.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      currentSection = button.dataset.section;
      document.querySelector(".sidebar").classList.remove("open");
      renderNav();
      renderCurrentSection();
    });
  });
}

function renderCurrentSection() {
  const activeLabel = navByRole[currentUser.role].find(([key]) => key === currentSection)?.[1] || "Dashboard";
  document.querySelector("#section-title").textContent = activeLabel;
  document.querySelector("#section-kicker").textContent = roleLabels[currentUser.role];

  const renderers = {
    admin: renderAdmin,
    organizer: renderOrganizer,
    student: renderStudent,
    faculty: renderFaculty
  };

  content.innerHTML = renderers[currentUser.role](currentSection);
  bindSectionActions();
}

function renderAdmin(section) {
  if (section === "profile") return renderProfile();
  if (section === "users") return renderUsersPanel();
  if (section === "approvals") return renderApprovalPanel("admin");
  if (section === "activities") return renderActivities();
  if (section === "database") return renderDatabase();
  if (section === "reports") return renderReports();
  return `
    ${renderStats()}
    <section class="grid-two">
      ${renderApprovalPanel("admin", true)}
      ${renderActivities(true)}
    </section>
  `;
}

function renderOrganizer(section) {
  if (section === "profile") return renderProfile();
  if (section === "manage-events") return renderManageEvents();
  if (section === "participants") return renderParticipants();
  if (section === "announcements") return renderAnnouncements();
  return `
    ${renderStats(true)}
    <section class="grid-two">
      ${renderManageEvents(true)}
      ${renderParticipants(true)}
    </section>
  `;
}

function renderStudent(section) {
  if (section === "profile") return renderProfile();
  if (section === "registered-events") return renderRegisteredEvents();
  if (section === "notifications") return renderNotifications();
  return renderAvailableEvents(section === "overview");
}

function renderFaculty(section) {
  if (section === "profile") return renderProfile();
  if (section === "monitor") return renderMonitor();
  return `
    ${renderStats()}
    ${renderApprovalPanel("faculty")}
  `;
}

function renderStats(organizerOnly = false) {
  const events = organizerOnly ? state.events.filter((event) => event.organizer === currentUser.name) : state.events;
  const registrations = events.reduce((sum, event) => sum + event.participants.length, 0);
  return `
    <section class="stats-grid">
      <article class="stat-card"><strong>${state.users.length}</strong><span>Total users</span></article>
      <article class="stat-card"><strong>${events.length}</strong><span>${organizerOnly ? "My events" : "Total events"}</span></article>
      <article class="stat-card"><strong>${registrations}</strong><span>Registrations</span></article>
    </section>
  `;
}

function renderUsersPanel() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>User Management</h3>
          <p>Add students, faculty, organizers, and admins to the demo system.</p>
        </div>
      </div>
      <form id="user-form" class="form-stack grid-two">
        <label>Name<input id="user-name" required minlength="2" placeholder="New user name"></label>
        <label>Email<input id="user-email" required type="email" placeholder="name@college.edu"></label>
        <label>Role
          <select id="user-role" required>
            <option value="student">Student</option>
            <option value="faculty">Faculty/Staff</option>
            <option value="organizer">Event Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label>&nbsp;<button class="primary-btn" type="submit">Add User</button></label>
      </form>
    </section>
    ${renderUsersTable()}
  `;
}

function renderUsersTable() {
  return `
    <section class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
        <tbody>
          ${state.users.map((user) => `
            <tr>
              <td>
                <div class="table-user">
                  <img src="${user.avatar || DEFAULT_AVATARS[user.role]}" alt="${user.name} profile photo">
                  <div><strong>${user.name}</strong><span>${user.department || "General"}</span></div>
                </div>
              </td>
              <td>${user.email}</td>
              <td>${roleLabels[user.role]}</td>
              <td><button class="danger-btn" type="button" data-remove-user="${user.id}">Remove</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderApprovalPanel(role, compact = false) {
  const pending = state.events.filter((event) => event.status === "pending");
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>${role === "faculty" ? "Faculty Approvals" : "Event Approvals"}</h3>
          <p>${pending.length} event${pending.length === 1 ? "" : "s"} awaiting review.</p>
        </div>
      </div>
      <div class="cards-grid">
        ${pending.length ? pending.map(renderEventCard).join("") : `<div class="empty-state">No events are pending approval.</div>`}
      </div>
    </section>
  `;
}

function renderManageEvents(compact = false) {
  const myEvents = state.events.filter((event) => event.organizer === currentUser.name);
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Create Event</h3>
          <p>Submitted events start as pending until Admin or Faculty approves them.</p>
        </div>
      </div>
      <form id="event-form" class="form-stack grid-two">
        <input type="hidden" id="event-id">
        <label>Event name<input id="event-name" required minlength="3" placeholder="Annual Tech Fest"></label>
        <label>Category<input id="event-category" required minlength="3" placeholder="Technology"></label>
        <label>Date<input id="event-date" required type="date"></label>
        <label>Time<input id="event-time" required type="time"></label>
        <label>Venue<input id="event-venue" required minlength="3" placeholder="Auditorium"></label>
        <label>Capacity<input id="event-capacity" required type="number" min="1" placeholder="120"></label>
        <input type="hidden" id="event-image">
        <label class="full-span">Event cover image
          <div class="upload-zone">
            <img id="event-image-preview" src="${DEFAULT_EVENT_IMAGES[0]}" alt="Event cover preview">
            <div>
              <strong>Upload event image</strong>
              <span>Choose a JPG or PNG from your computer.</span>
              <input id="event-image-file" type="file" accept="image/*">
            </div>
          </div>
        </label>
        <label class="full-span">Description<textarea id="event-description" required minlength="10" placeholder="Describe the event"></textarea></label>
        <label>&nbsp;<button class="primary-btn" type="submit">Save Event</button></label>
      </form>
    </section>
    <section class="panel">
      <div class="panel-header"><h3>My Events</h3></div>
      <div class="cards-grid">
        ${myEvents.length ? myEvents.map(renderEventCard).join("") : `<div class="empty-state">No events created yet.</div>`}
      </div>
    </section>
  `;
}

function renderParticipants(compact = false) {
  const myEvents = state.events.filter((event) => event.organizer === currentUser.name);
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Participant Lists</h3>
          <p>See who has registered for your events.</p>
        </div>
      </div>
      <div class="cards-grid">
        ${myEvents.length ? myEvents.map((event) => `
          <article class="event-card">
            <img class="event-image" src="${event.image || DEFAULT_EVENT_IMAGES[0]}" alt="${event.name} event cover">
            <h3>${event.name}</h3>
            <div class="meta-row">
              <span class="meta-pill">${event.participants.length} participants</span>
              <span class="meta-pill">${countAttendance(event, "present")} present</span>
              <span class="meta-pill">${countAttendance(event, "absent")} absent</span>
            </div>
            ${event.participants.length ? renderAttendanceTable(event) : "<p>No registrations yet.</p>"}
          </article>
        `).join("") : `<div class="empty-state">Create an event to view participant lists.</div>`}
      </div>
    </section>
  `;
}

function renderAnnouncements() {
  const myEvents = state.events.filter((event) => event.organizer === currentUser.name);
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Post Announcement</h3>
          <p>Announcements appear in student notifications.</p>
        </div>
      </div>
      <form id="announcement-form" class="form-stack">
        <label>Event
          <select id="announcement-event" required>
            <option value="">Select event</option>
            ${myEvents.map((event) => `<option value="${event.id}">${event.name}</option>`).join("")}
          </select>
        </label>
        <label>Message<textarea id="announcement-message" required minlength="5" placeholder="Share an update"></textarea></label>
        <button class="primary-btn" type="submit">Post Announcement</button>
      </form>
    </section>
    <section class="panel">
      <div class="panel-header"><h3>Recent Announcements</h3></div>
      <div class="notification-list">
        ${myEvents.flatMap((event) => event.announcements.map((message) => `
          <article class="notification-item"><strong>${event.name}</strong><p>${message}</p></article>
        `)).join("") || `<div class="empty-state">No announcements posted yet.</div>`}
      </div>
    </section>
  `;
}

function renderProfile() {
  return `
    <section class="profile-hero panel">
      <img class="profile-cover" src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1400&q=80" alt="Students collaborating on campus">
      <div class="profile-summary">
        <div class="profile-photo-large">
          ${currentUser.avatar ? `<img src="${currentUser.avatar}" alt="${currentUser.name} profile photo">` : currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <span class="eyebrow">${roleLabels[currentUser.role]}</span>
          <h3>${currentUser.name}</h3>
          <p>${currentUser.bio || "Campus community member."}</p>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Update Profile</h3>
          <p>Keep your campus identity, contact details, and profile image current.</p>
        </div>
      </div>
      <form id="profile-form" class="form-stack grid-two">
        <label>Full name<input id="profile-edit-name" required minlength="2" value="${currentUser.name}"></label>
        <label>Email<input id="profile-edit-email" required type="email" value="${currentUser.email}"></label>
        <label>Department<input id="profile-edit-department" value="${currentUser.department || ""}" placeholder="Computer Science"></label>
        <label>Phone<input id="profile-edit-phone" value="${currentUser.phone || ""}" placeholder="+91 98765 43210"></label>
        <input id="profile-edit-avatar" type="hidden" value="${currentUser.avatar || ""}">
        <label class="full-span">Profile picture
          <div class="upload-zone profile-upload">
            <img id="profile-avatar-preview" src="${currentUser.avatar || DEFAULT_AVATARS[currentUser.role]}" alt="Profile picture preview">
            <div>
              <strong>Upload profile picture</strong>
              <span>Choose a clear student or staff photo from your computer.</span>
              <input id="profile-avatar-file" type="file" accept="image/*">
            </div>
          </div>
        </label>
        <label class="full-span">Bio<textarea id="profile-edit-bio" maxlength="180" placeholder="Write a short profile bio">${currentUser.bio || ""}</textarea></label>
        <label>&nbsp;<button class="primary-btn" type="submit">Update Profile</button></label>
      </form>
    </section>

    <section class="panel danger-zone">
      <div class="panel-header">
        <div>
          <h3>Delete Profile</h3>
          <p>Permanently remove your profile, notifications, and event registrations from this system.</p>
        </div>
        <button id="delete-profile-btn" class="danger-btn" type="button">Delete My Profile</button>
      </div>
    </section>
  `;
}

function renderAvailableEvents(compact = false) {
  const approved = state.events.filter((event) => event.status === "approved");
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Available Events</h3>
          <p>Register for approved events and track your campus participation.</p>
        </div>
      </div>
      <div class="cards-grid">
        ${approved.length ? approved.map(renderEventCard).join("") : `<div class="empty-state">No approved events are available.</div>`}
      </div>
    </section>
  `;
}

function renderRegisteredEvents() {
  const registered = state.events.filter((event) => event.participants.includes(currentUser.name));
  return `
    <section class="panel">
      <div class="panel-header"><h3>Registration History</h3></div>
      <div class="cards-grid">
        ${registered.length ? registered.map(renderEventCard).join("") : `<div class="empty-state">You have not registered for any events yet.</div>`}
      </div>
    </section>
  `;
}

function renderAttendanceTable(event) {
  return `
    <div class="attendance-table">
      ${event.participants.map((participant) => `
        <div class="attendance-row">
          <span>${participant}</span>
          <strong class="attendance-${event.attendance?.[participant] || "registered"}">${capitalize(event.attendance?.[participant] || "registered")}</strong>
          <div class="button-row">
            <button class="success-btn" type="button" data-attendance-event="${event.id}" data-attendance-student="${participant}" data-attendance-status="present">Present</button>
            <button class="warning-btn" type="button" data-attendance-event="${event.id}" data-attendance-student="${participant}" data-attendance-status="absent">Absent</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderNotifications() {
  const notifications = state.notifications[currentUser.name] || [];
  return `
    <section class="panel">
      <div class="panel-header"><h3>Notifications</h3></div>
      <div class="notification-list">
        ${notifications.length ? notifications.map((message) => `
          <article class="notification-item"><strong>AJ Square</strong><p>${message}</p></article>
        `).join("") : `<div class="empty-state">No notifications yet.</div>`}
      </div>
    </section>
  `;
}

function renderMonitor() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Event Monitor</h3>
          <p>Review event details, statuses, organizers, and registration volume.</p>
        </div>
      </div>
      <div class="cards-grid">${state.events.map(renderEventCard).join("")}</div>
    </section>
  `;
}

function renderActivities(compact = false) {
  return `
    <section class="panel">
      <div class="panel-header"><h3>System Activities</h3></div>
      <div class="activity-list">
        ${state.activities.slice(0, compact ? 5 : state.activities.length).map((activity) => `
          <article class="activity-item"><strong>Activity</strong><p>${activity}</p></article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderReports() {
  const approved = state.events.filter((event) => event.status === "approved").length;
  const pending = state.events.filter((event) => event.status === "pending").length;
  const rejected = state.events.filter((event) => event.status === "rejected").length;
  const topEvent = [...state.events].sort((a, b) => b.participants.length - a.participants.length)[0];

  return `
    ${renderStats()}
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Generated Report</h3>
          <p>This report is generated from current JavaScript/localStorage data.</p>
        </div>
      </div>
      <div class="activity-list">
        <article class="activity-item"><strong>Approval Summary</strong><p>${approved} approved, ${pending} pending, ${rejected} rejected.</p></article>
        <article class="activity-item"><strong>Most Popular Event</strong><p>${topEvent ? `${topEvent.name} with ${topEvent.participants.length} registrations.` : "No events available."}</p></article>
        <article class="activity-item"><strong>User Mix</strong><p>${roleCountReport()}</p></article>
      </div>
    </section>
  `;
}

function renderDatabase() {
  const databaseCards = [
    ["Users table", state.users.length, "Identity, role, department, profile, and contact records"],
    ["Events table", state.events.length, "Event schedule, approval status, venue, capacity, and media"],
    ["Activity logs", state.activities.length, "Recent operational activity generated by users"],
    ["Audit trail", state.auditTrail?.length || 0, "System-style records for admin tracking"]
  ];

  return `
    <section class="database-hero panel">
      <div>
        <span class="eyebrow">SQL Database</span>
        <h3>${sqlDatabaseEnabled ? "Connected to MySQL database" : "Browser fallback mode"}</h3>
        <p>${sqlDatabaseEnabled ? "The dashboard is loading and saving data through <strong>api.php</strong> into the <strong>aj_square_events</strong> MySQL database." : "Open this project through XAMPP/WAMP and import <strong>database.sql</strong> to store data in MySQL. Direct file preview uses localStorage fallback."}</p>
      </div>
      <div class="database-grid">
        ${databaseCards.map(([label, value, description]) => `
          <article>
            <strong>${value}</strong>
            <span>${label}</span>
            <p>${description}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Users Collection</h3>
          <p>Representative records stored in the mock database.</p>
        </div>
      </div>
      ${renderUsersTable()}
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Events Collection</h3>
          <p>Event records include category, status, capacity, approval owner, and registrations.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Event</th><th>Category</th><th>Status</th><th>Capacity</th><th>Approved By</th></tr></thead>
          <tbody>
            ${state.events.map((event) => `
              <tr>
                <td><strong>${event.name}</strong><br><span class="table-muted">${event.venue} | ${formatDate(event.date)}</span></td>
                <td>${event.category}</td>
                <td><span class="status-pill status-${event.status}">${capitalize(event.status)}</span></td>
                <td>${event.participants.length}/${event.capacity}</td>
                <td>${event.approvedBy || "Awaiting review"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderEventCard(event) {
  const registered = event.participants.includes(currentUser?.name);
  const canApprove = ["admin", "faculty"].includes(currentUser?.role) && event.status === "pending";
  const canManage = currentUser?.role === "organizer" && event.organizer === currentUser.name;
  const canRegister = currentUser?.role === "student" && event.status === "approved";
  const studentAttendance = event.attendance?.[currentUser?.name];

  return `
    <article class="event-card">
      <img class="event-image" src="${event.image || DEFAULT_EVENT_IMAGES[0]}" alt="${event.name} event cover">
      <div class="tag-row">
        <span class="status-pill status-${event.status}">${capitalize(event.status)}</span>
        <span class="meta-pill">${event.category}</span>
        <span class="meta-pill">${event.participants.length} registered</span>
        ${studentAttendance ? `<span class="meta-pill attendance-${studentAttendance}">${capitalize(studentAttendance)}</span>` : ""}
      </div>
      <h3>${event.name}</h3>
      <p>${event.description}</p>
      <div class="meta-row">
        <span class="meta-pill">${formatDate(event.date)}</span>
        <span class="meta-pill">${event.time}</span>
        <span class="meta-pill">${event.venue}</span>
        <span class="meta-pill">${event.participants.length}/${event.capacity} seats</span>
      </div>
      <p><strong>Organizer:</strong> ${event.organizer}</p>
      <p><strong>Attendance:</strong> ${countAttendance(event, "present")} present, ${countAttendance(event, "absent")} absent</p>
      ${event.announcements.length ? `<p><strong>Latest:</strong> ${event.announcements.at(-1)}</p>` : ""}
      <div class="button-row">
        ${canRegister ? `<button class="${registered ? "secondary-btn" : "primary-btn"}" type="button" data-register="${event.id}">${registered ? "Registered" : "Register"}</button>` : ""}
        ${canApprove ? `<button class="success-btn" type="button" data-approve="${event.id}">Approve</button><button class="warning-btn" type="button" data-reject="${event.id}">Reject</button>` : ""}
        ${canManage ? `<button class="secondary-btn" type="button" data-edit-event="${event.id}">Edit</button><button class="danger-btn" type="button" data-delete-event="${event.id}">Delete</button>` : ""}
      </div>
    </article>
  `;
}

function bindSectionActions() {
  document.querySelector("#user-form")?.addEventListener("submit", addUser);
  document.querySelector("#event-form")?.addEventListener("submit", saveEvent);
  document.querySelector("#announcement-form")?.addEventListener("submit", postAnnouncement);
  document.querySelector("#profile-form")?.addEventListener("submit", updateProfile);
  document.querySelector("#delete-profile-btn")?.addEventListener("click", deleteCurrentProfile);
  document.querySelector("#profile-avatar-file")?.addEventListener("change", (event) => handleImageUpload(event, "#profile-edit-avatar", "#profile-avatar-preview"));
  document.querySelector("#event-image-file")?.addEventListener("change", (event) => handleImageUpload(event, "#event-image", "#event-image-preview"));

  document.querySelectorAll("[data-remove-user]").forEach((button) => button.addEventListener("click", () => removeUser(Number(button.dataset.removeUser))));
  document.querySelectorAll("[data-approve]").forEach((button) => button.addEventListener("click", () => setEventStatus(Number(button.dataset.approve), "approved")));
  document.querySelectorAll("[data-reject]").forEach((button) => button.addEventListener("click", () => setEventStatus(Number(button.dataset.reject), "rejected")));
  document.querySelectorAll("[data-register]").forEach((button) => button.addEventListener("click", () => registerForEvent(Number(button.dataset.register))));
  document.querySelectorAll("[data-delete-event]").forEach((button) => button.addEventListener("click", () => deleteEvent(Number(button.dataset.deleteEvent))));
  document.querySelectorAll("[data-edit-event]").forEach((button) => button.addEventListener("click", () => fillEventForm(Number(button.dataset.editEvent))));
  document.querySelectorAll("[data-attendance-event]").forEach((button) => button.addEventListener("click", () => markAttendance(
    Number(button.dataset.attendanceEvent),
    button.dataset.attendanceStudent,
    button.dataset.attendanceStatus
  )));
}

function addUser(event) {
  event.preventDefault();
  const user = {
    id: Date.now(),
    name: document.querySelector("#user-name").value.trim(),
    email: document.querySelector("#user-email").value.trim(),
    role: document.querySelector("#user-role").value,
    department: "General",
    phone: "",
    bio: "Campus community member.",
    avatar: DEFAULT_AVATARS[document.querySelector("#user-role").value]
  };

  if (!user.name || !user.email || !user.role) {
    showToast("Please complete every user field.", "error");
    return;
  }

  state.users.push(user);
  addActivity(`${user.name} was added as ${roleLabels[user.role]}.`);
  saveState();
  renderCurrentSection();
  showToast("User added successfully.", "success");
}

function removeUser(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  state.users = state.users.filter((item) => item.id !== userId);
  addActivity(`${user.name} was removed from the system.`);
  saveState();
  renderCurrentSection();
  showToast("User removed.", "success");
}

function saveEvent(event) {
  event.preventDefault();
  const id = Number(document.querySelector("#event-id").value);
  const eventData = {
    id: id || Date.now(),
    name: document.querySelector("#event-name").value.trim(),
    category: document.querySelector("#event-category").value.trim(),
    date: document.querySelector("#event-date").value,
    time: document.querySelector("#event-time").value,
    venue: document.querySelector("#event-venue").value.trim(),
    capacity: Number(document.querySelector("#event-capacity").value),
    description: document.querySelector("#event-description").value.trim(),
    image: document.querySelector("#event-image").value.trim() || DEFAULT_EVENT_IMAGES[state.events.length % DEFAULT_EVENT_IMAGES.length],
    status: "pending",
    organizer: currentUser.name,
    participants: [],
    announcements: [],
    attendance: {}
  };

  if (!eventData.name || !eventData.category || !eventData.date || !eventData.time || !eventData.venue || !eventData.capacity || eventData.description.length < 10) {
    showToast("Please complete the event form with a meaningful description.", "error");
    return;
  }

  const existing = state.events.find((item) => item.id === id);
  if (existing) {
    Object.assign(existing, { ...eventData, participants: existing.participants, announcements: existing.announcements, attendance: existing.attendance || {}, status: existing.status });
    addActivity(`${eventData.name} was updated by ${currentUser.name}.`);
  } else {
    state.events.push(eventData);
    addActivity(`${eventData.name} was submitted for approval.`);
  }

  saveState();
  renderCurrentSection();
  showToast("Event saved successfully.", "success");
}

function fillEventForm(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;
  document.querySelector("#event-id").value = event.id;
  document.querySelector("#event-name").value = event.name;
  document.querySelector("#event-category").value = event.category || "General";
  document.querySelector("#event-date").value = event.date;
  document.querySelector("#event-time").value = event.time;
  document.querySelector("#event-venue").value = event.venue;
  document.querySelector("#event-capacity").value = event.capacity || 100;
  document.querySelector("#event-image").value = event.image || "";
  document.querySelector("#event-image-preview").src = event.image || DEFAULT_EVENT_IMAGES[0];
  document.querySelector("#event-description").value = event.description;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProfile(event) {
  event.preventDefault();
  const previousName = currentUser.name;
  const updatedName = document.querySelector("#profile-edit-name").value.trim();
  const updatedEmail = document.querySelector("#profile-edit-email").value.trim();

  if (updatedName.length < 2 || !updatedEmail) {
    showToast("Please enter a valid name and email.", "error");
    return;
  }

  currentUser.name = updatedName;
  currentUser.email = updatedEmail;
  currentUser.department = document.querySelector("#profile-edit-department").value.trim();
  currentUser.phone = document.querySelector("#profile-edit-phone").value.trim();
  currentUser.avatar = document.querySelector("#profile-edit-avatar").value.trim() || DEFAULT_AVATARS[currentUser.role];
  currentUser.bio = document.querySelector("#profile-edit-bio").value.trim();

  if (previousName !== updatedName) {
    state.events.forEach((eventItem) => {
      if (eventItem.organizer === previousName) eventItem.organizer = updatedName;
      eventItem.participants = eventItem.participants.map((participant) => participant === previousName ? updatedName : participant);
    });

    if (state.notifications[previousName]) {
      state.notifications[updatedName] = state.notifications[previousName];
      delete state.notifications[previousName];
    }
  }

  addActivity(`${updatedName} updated their profile.`);
  saveState();
  updateProfileShell();
  renderCurrentSection();
  showToast("Profile updated successfully.", "success");
}

function deleteCurrentProfile() {
  const confirmed = window.confirm("Delete your profile permanently? This will remove your account, registrations, and notifications.");
  if (!confirmed) return;

  const deletedName = currentUser.name;
  state.users = state.users.filter((user) => user.id !== currentUser.id);
  state.events.forEach((eventItem) => {
    eventItem.participants = eventItem.participants.filter((participant) => participant !== deletedName);
    if (eventItem.attendance) delete eventItem.attendance[deletedName];
    if (eventItem.organizer === deletedName) {
      eventItem.organizer = "Former Organizer";
    }
  });

  delete state.notifications[deletedName];
  addActivity(`${deletedName} deleted their profile.`);
  saveState();

  currentUser = null;
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
  document.querySelector("#login-name").value = "";
  document.querySelector("#login-role").value = "";
  showToast("Your profile has been deleted.", "success");
}

function deleteEvent(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  state.events = state.events.filter((item) => item.id !== eventId);
  addActivity(`${event.name} was deleted by ${currentUser.name}.`);
  saveState();
  renderCurrentSection();
  showToast("Event deleted.", "success");
}

function setEventStatus(eventId, status) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;
  event.status = status;
  event.approvedBy = status === "approved" || status === "rejected" ? currentUser.name : "";
  addActivity(`${event.name} was ${status} by ${currentUser.name}.`);
  notifyAllStudents(`${event.name} was ${status}.`);
  saveState();
  renderCurrentSection();
  showToast(`Event ${status}.`, "success");
}

function registerForEvent(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event || event.participants.includes(currentUser.name)) {
    showToast("You are already registered for this event.", "error");
    return;
  }
  if (event.participants.length >= event.capacity) {
    showToast("This event is already full.", "error");
    return;
  }
  event.participants.push(currentUser.name);
  if (!event.attendance) event.attendance = {};
  event.attendance[currentUser.name] = "registered";
  addNotification(currentUser.name, `You registered for ${event.name}.`);
  addActivity(`${currentUser.name} registered for ${event.name}.`);
  saveState();
  renderCurrentSection();
  showToast("Registration confirmed.", "success");
}

function markAttendance(eventId, studentName, status) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event || !event.participants.includes(studentName)) return;

  if (!event.attendance) event.attendance = {};
  event.attendance[studentName] = status;
  addActivity(`${studentName} was marked ${status} for ${event.name}.`);
  addNotification(studentName, `Your attendance for ${event.name} was marked ${status}.`);
  saveState();
  renderCurrentSection();
  showToast(`Attendance marked ${status}.`, "success");
}

function countAttendance(event, status) {
  return Object.values(event.attendance || {}).filter((value) => value === status).length;
}

function handleImageUpload(event, hiddenSelector, previewSelector) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please select a valid image file.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    document.querySelector(hiddenSelector).value = reader.result;
    document.querySelector(previewSelector).src = reader.result;
    showToast("Image uploaded successfully.", "success");
  };
  reader.readAsDataURL(file);
}

function postAnnouncement(event) {
  event.preventDefault();
  const eventId = Number(document.querySelector("#announcement-event").value);
  const message = document.querySelector("#announcement-message").value.trim();
  const targetEvent = state.events.find((item) => item.id === eventId);

  if (!targetEvent || message.length < 5) {
    showToast("Select an event and enter a useful announcement.", "error");
    return;
  }

  targetEvent.announcements.push(message);
  targetEvent.participants.forEach((student) => addNotification(student, `${targetEvent.name}: ${message}`));
  addActivity(`${currentUser.name} posted an announcement for ${targetEvent.name}.`);
  saveState();
  renderCurrentSection();
  showToast("Announcement posted.", "success");
}

function addActivity(message) {
  state.activities.unshift(message);
}

function addNotification(name, message) {
  if (!state.notifications[name]) state.notifications[name] = [];
  state.notifications[name].unshift(message);
}

function notifyAllStudents(message) {
  state.users.filter((user) => user.role === "student").forEach((student) => addNotification(student.name, message));
}

function updateLoginStats() {
  document.querySelector("#login-stat-events").textContent = state.events.length;
  document.querySelector("#login-stat-users").textContent = state.users.length;
  document.querySelector("#login-stat-registrations").textContent = state.events.reduce((sum, event) => sum + event.participants.length, 0);
}

function roleCountReport() {
  return Object.entries(roleLabels).map(([role, label]) => {
    const count = state.users.filter((user) => user.role === role).length;
    return `${label}: ${count}`;
  }).join(" | ");
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function showToast(message, type = "success") {
  toast.innerHTML = `<div class="toast-message ${type}">${message}</div>`;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
