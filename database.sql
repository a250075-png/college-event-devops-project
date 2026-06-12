CREATE DATABASE IF NOT EXISTS aj_square_events;
USE aj_square_events;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS event_participants;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS audit_trail;

CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  role ENUM('admin', 'organizer', 'student', 'faculty') NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  department VARCHAR(120) DEFAULT 'General',
  phone VARCHAR(40) DEFAULT '',
  bio TEXT,
  avatar LONGTEXT,
  status VARCHAR(30) DEFAULT 'active',
  joined_on DATE DEFAULT (CURRENT_DATE)
);

CREATE TABLE events (
  id INT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(80) DEFAULT 'General',
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  venue VARCHAR(160) NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  description TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  organizer_name VARCHAR(120) NOT NULL,
  approved_by VARCHAR(120) DEFAULT '',
  image LONGTEXT
);

CREATE TABLE event_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_name VARCHAR(120) NOT NULL,
  attendance_status ENUM('registered', 'present', 'absent') DEFAULT 'registered',
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_trail (
  id INT PRIMARY KEY,
  actor VARCHAR(120) NOT NULL,
  action VARCHAR(160) NOT NULL,
  module VARCHAR(80) NOT NULL,
  action_time VARCHAR(40) NOT NULL
);

INSERT INTO users (id, name, role, email, department, phone, bio, avatar, status, joined_on) VALUES
(1001, 'Dr. Meera Rao', 'admin', 'meera.rao@ajsquare.edu', 'Campus Administration', '+91 98765 12001', 'Leads governance, approvals, and institution-wide event operations.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'active', '2024-07-01'),
(1002, 'Arjun Mehta', 'organizer', 'arjun.mehta@ajsquare.edu', 'Student Council', '+91 98765 12002', 'Plans flagship student programs, speaker sessions, and cultural experiences.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'active', '2024-08-12'),
(1003, 'Nisha Patel', 'student', 'nisha.patel@ajsquare.edu', 'Computer Science', '+91 98765 12003', 'Interested in hackathons, product design, and technical club events.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'active', '2025-01-10'),
(1004, 'Prof. Kabir Sen', 'faculty', 'kabir.sen@ajsquare.edu', 'Research and Innovation', '+91 98765 12004', 'Reviews academic events and mentors research-oriented student teams.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80', 'active', '2023-09-18'),
(1005, 'Tara Iyer', 'student', 'tara.iyer@ajsquare.edu', 'Electronics', '+91 98765 12005', 'Active in electronics workshops, robotics demos, and research expos.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', 'active', '2025-02-02'),
(1006, 'Rohan Das', 'student', 'rohan.das@ajsquare.edu', 'Business Administration', '+91 98765 12006', 'Works with the entrepreneurship cell and sponsorship team.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', 'active', '2025-03-04'),
(1007, 'Ananya Shah', 'organizer', 'ananya.shah@ajsquare.edu', 'Cultural Committee', '+91 98765 12007', 'Coordinates performances, creative showcases, and festival programming.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 'active', '2024-11-21'),
(1008, 'Prof. Lina Thomas', 'faculty', 'lina.thomas@ajsquare.edu', 'Humanities', '+91 98765 12008', 'Supports debate, literature, and public speaking initiatives.', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80', 'active', '2024-06-14');

INSERT INTO events (id, name, category, event_date, event_time, venue, capacity, description, status, organizer_name, approved_by, image) VALUES
(2001, 'Innovation Sprint', 'Technology', '2026-05-12', '10:00:00', 'Incubation Lab', 80, 'A one-day ideation sprint for student startup concepts, prototypes, and pitch decks.', 'approved', 'Arjun Mehta', 'Prof. Kabir Sen', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80'),
(2002, 'Cultural Night', 'Culture', '2026-05-18', '17:30:00', 'Open Amphitheatre', 350, 'Music, dance, theatre, fashion, and campus club performances under one evening showcase.', 'pending', 'Ananya Shah', '', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80'),
(2003, 'Research Poster Expo', 'Academic', '2026-05-24', '14:00:00', 'Main Seminar Hall', 120, 'Faculty-guided poster presentations from final-year students and research groups.', 'approved', 'Science Forum', 'Prof. Kabir Sen', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80'),
(2004, 'Leadership Conclave', 'Career', '2026-06-02', '11:00:00', 'Executive Auditorium', 180, 'A professional development conclave with alumni leaders, founders, and HR mentors.', 'approved', 'Arjun Mehta', 'Dr. Meera Rao', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80'),
(2005, 'Design Thinking Workshop', 'Workshop', '2026-06-08', '09:30:00', 'Design Studio B', 60, 'Hands-on workshop covering user research, journey maps, wireframes, and rapid testing.', 'pending', 'Arjun Mehta', '', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80'),
(2006, 'Interdepartment Debate League', 'Literary', '2026-06-15', '15:00:00', 'Humanities Block Hall', 100, 'A structured debate league for departments with judging by faculty and alumni speakers.', 'rejected', 'Literary Society', 'Prof. Lina Thomas', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80');

INSERT INTO event_participants (event_id, participant_name, attendance_status) VALUES
(2001, 'Nisha Patel', 'present'),
(2001, 'Rohan Das', 'registered'),
(2002, 'Tara Iyer', 'registered'),
(2003, 'Tara Iyer', 'present'),
(2003, 'Nisha Patel', 'absent'),
(2004, 'Rohan Das', 'registered');

INSERT INTO announcements (event_id, message) VALUES
(2001, 'Bring your laptop and a rough problem statement.'),
(2001, 'Mentor review starts at 3:30 PM.'),
(2002, 'Performer auditions close on May 10.'),
(2003, 'Poster boards will be provided at the venue.'),
(2004, 'Business formal dress code is recommended.'),
(2006, 'Proposal needs revised judging criteria before resubmission.');

INSERT INTO activities (message) VALUES
('Dr. Meera Rao generated the monthly participation report.'),
('Leadership Conclave was approved by Dr. Meera Rao.'),
('Nisha Patel registered for Research Poster Expo.'),
('Design Thinking Workshop was submitted for approval.'),
('Interdepartment Debate League was rejected pending policy updates.'),
('Rohan Das registered for Innovation Sprint.'),
('Cultural Night was submitted by Ananya Shah.'),
('Innovation Sprint was approved by Prof. Kabir Sen.');

INSERT INTO notifications (user_name, message) VALUES
('Nisha Patel', 'You are registered for Innovation Sprint.'),
('Nisha Patel', 'Research Poster Expo is open for registration.'),
('Nisha Patel', 'Mentor review for Innovation Sprint starts at 3:30 PM.'),
('Tara Iyer', 'You are registered for Research Poster Expo.'),
('Tara Iyer', 'Cultural Night performer auditions close on May 10.'),
('Rohan Das', 'You are registered for Innovation Sprint.'),
('Rohan Das', 'Leadership Conclave recommends business formal attire.');

INSERT INTO audit_trail (id, actor, action, module, action_time) VALUES
(3001, 'Dr. Meera Rao', 'Generated report', 'Reports', '2026-05-06 09:30'),
(3002, 'Prof. Kabir Sen', 'Approved event', 'Approvals', '2026-05-05 16:20'),
(3003, 'Ananya Shah', 'Submitted event', 'Events', '2026-05-05 11:45'),
(3004, 'Nisha Patel', 'Updated profile', 'Users', '2026-05-04 14:10');
