// Mock database for AJ Square. In a real project, this data would come from a backend API.
window.AJ_SQUARE_DATABASE = {
  users: [
    {
      id: 1001,
      name: "Dr. Meera Rao",
      role: "admin",
      email: "meera.rao@ajsquare.edu",
      department: "Campus Administration",
      phone: "+91 98765 12001",
      bio: "Leads governance, approvals, and institution-wide event operations.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2024-07-01"
    },
    {
      id: 1002,
      name: "Arjun Mehta",
      role: "organizer",
      email: "arjun.mehta@ajsquare.edu",
      department: "Student Council",
      phone: "+91 98765 12002",
      bio: "Plans flagship student programs, speaker sessions, and cultural experiences.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2024-08-12"
    },
    {
      id: 1003,
      name: "Nisha Patel",
      role: "student",
      email: "nisha.patel@ajsquare.edu",
      department: "Computer Science",
      phone: "+91 98765 12003",
      bio: "Interested in hackathons, product design, and technical club events.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2025-01-10"
    },
    {
      id: 1004,
      name: "Prof. Kabir Sen",
      role: "faculty",
      email: "kabir.sen@ajsquare.edu",
      department: "Research and Innovation",
      phone: "+91 98765 12004",
      bio: "Reviews academic events and mentors research-oriented student teams.",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2023-09-18"
    },
    {
      id: 1005,
      name: "Tara Iyer",
      role: "student",
      email: "tara.iyer@ajsquare.edu",
      department: "Electronics",
      phone: "+91 98765 12005",
      bio: "Active in electronics workshops, robotics demos, and research expos.",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2025-02-02"
    },
    {
      id: 1006,
      name: "Rohan Das",
      role: "student",
      email: "rohan.das@ajsquare.edu",
      department: "Business Administration",
      phone: "+91 98765 12006",
      bio: "Works with the entrepreneurship cell and sponsorship team.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2025-03-04"
    },
    {
      id: 1007,
      name: "Ananya Shah",
      role: "organizer",
      email: "ananya.shah@ajsquare.edu",
      department: "Cultural Committee",
      phone: "+91 98765 12007",
      bio: "Coordinates performances, creative showcases, and festival programming.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2024-11-21"
    },
    {
      id: 1008,
      name: "Prof. Lina Thomas",
      role: "faculty",
      email: "lina.thomas@ajsquare.edu",
      department: "Humanities",
      phone: "+91 98765 12008",
      bio: "Supports debate, literature, and public speaking initiatives.",
      avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80",
      status: "active",
      joinedOn: "2024-06-14"
    }
  ],
  events: [
    {
      id: 2001,
      name: "Innovation Sprint",
      category: "Technology",
      date: "2026-05-12",
      time: "10:00",
      venue: "Incubation Lab",
      capacity: 80,
      description: "A one-day ideation sprint for student startup concepts, prototypes, and pitch decks.",
      status: "approved",
      organizer: "Arjun Mehta",
      approvedBy: "Prof. Kabir Sen",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
      participants: ["Nisha Patel", "Rohan Das"],
      attendance: { "Nisha Patel": "present", "Rohan Das": "registered" },
      announcements: ["Bring your laptop and a rough problem statement.", "Mentor review starts at 3:30 PM."]
    },
    {
      id: 2002,
      name: "Cultural Night",
      category: "Culture",
      date: "2026-05-18",
      time: "17:30",
      venue: "Open Amphitheatre",
      capacity: 350,
      description: "Music, dance, theatre, fashion, and campus club performances under one evening showcase.",
      status: "pending",
      organizer: "Ananya Shah",
      approvedBy: "",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
      participants: ["Tara Iyer"],
      attendance: { "Tara Iyer": "registered" },
      announcements: ["Performer auditions close on May 10."]
    },
    {
      id: 2003,
      name: "Research Poster Expo",
      category: "Academic",
      date: "2026-05-24",
      time: "14:00",
      venue: "Main Seminar Hall",
      capacity: 120,
      description: "Faculty-guided poster presentations from final-year students and research groups.",
      status: "approved",
      organizer: "Science Forum",
      approvedBy: "Prof. Kabir Sen",
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
      participants: ["Tara Iyer", "Nisha Patel"],
      attendance: { "Tara Iyer": "present", "Nisha Patel": "absent" },
      announcements: ["Poster boards will be provided at the venue."]
    },
    {
      id: 2004,
      name: "Leadership Conclave",
      category: "Career",
      date: "2026-06-02",
      time: "11:00",
      venue: "Executive Auditorium",
      capacity: 180,
      description: "A professional development conclave with alumni leaders, founders, and HR mentors.",
      status: "approved",
      organizer: "Arjun Mehta",
      approvedBy: "Dr. Meera Rao",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
      participants: ["Rohan Das"],
      attendance: { "Rohan Das": "registered" },
      announcements: ["Business formal dress code is recommended."]
    },
    {
      id: 2005,
      name: "Design Thinking Workshop",
      category: "Workshop",
      date: "2026-06-08",
      time: "09:30",
      venue: "Design Studio B",
      capacity: 60,
      description: "Hands-on workshop covering user research, journey maps, wireframes, and rapid testing.",
      status: "pending",
      organizer: "Arjun Mehta",
      approvedBy: "",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
      participants: [],
      attendance: {},
      announcements: []
    },
    {
      id: 2006,
      name: "Interdepartment Debate League",
      category: "Literary",
      date: "2026-06-15",
      time: "15:00",
      venue: "Humanities Block Hall",
      capacity: 100,
      description: "A structured debate league for departments with judging by faculty and alumni speakers.",
      status: "rejected",
      organizer: "Literary Society",
      approvedBy: "Prof. Lina Thomas",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
      participants: [],
      attendance: {},
      announcements: ["Proposal needs revised judging criteria before resubmission."]
    }
  ],
  activities: [
    "Dr. Meera Rao generated the monthly participation report.",
    "Leadership Conclave was approved by Dr. Meera Rao.",
    "Nisha Patel registered for Research Poster Expo.",
    "Design Thinking Workshop was submitted for approval.",
    "Interdepartment Debate League was rejected pending policy updates.",
    "Rohan Das registered for Innovation Sprint.",
    "Cultural Night was submitted by Ananya Shah.",
    "Innovation Sprint was approved by Prof. Kabir Sen."
  ],
  notifications: {
    "Nisha Patel": [
      "You are registered for Innovation Sprint.",
      "Research Poster Expo is open for registration.",
      "Mentor review for Innovation Sprint starts at 3:30 PM."
    ],
    "Tara Iyer": [
      "You are registered for Research Poster Expo.",
      "Cultural Night performer auditions close on May 10."
    ],
    "Rohan Das": [
      "You are registered for Innovation Sprint.",
      "Leadership Conclave recommends business formal attire."
    ]
  },
  auditTrail: [
    { id: 3001, actor: "Dr. Meera Rao", action: "Generated report", module: "Reports", time: "2026-05-06 09:30" },
    { id: 3002, actor: "Prof. Kabir Sen", action: "Approved event", module: "Approvals", time: "2026-05-05 16:20" },
    { id: 3003, actor: "Ananya Shah", action: "Submitted event", module: "Events", time: "2026-05-05 11:45" },
    { id: 3004, actor: "Nisha Patel", action: "Updated profile", module: "Users", time: "2026-05-04 14:10" }
  ]
};
