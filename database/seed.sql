-- Smart Society Management System Seed Data
USE society_db;

-- Clear existing data
-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE complaints;
TRUNCATE TABLE maintenance;
TRUNCATE TABLE visitors;
TRUNCATE TABLE security;
TRUNCATE TABLE residents;
TRUNCATE TABLE admins;
TRUNCATE TABLE notices;
TRUNCATE TABLE emergency_contacts;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Default Admin Account (password: admin123)
INSERT INTO admins (name, email, password, phone, role) VALUES 
('Society Administrator', 'admin@society.com', 'admin123', '9876543210','admin');

-- 2. Default Residents (password: resident123)
INSERT INTO residents (name, email, password, phone, flat_number, wing, occupation, status, role) VALUES
('Rahul Sharma', 'resident@society.com', 'resident123', '9812345678', 'A-101', 'A Wing', 'Software Engineer', 'Active', 'resident'),
('Priya Verma', 'priya@society.com', 'resident123', '9823456789', 'B-204', 'B Wing', 'Architect', 'Active', 'resident'),
('Amitabh Patel', 'amitabh@society.com', 'resident123', '9834567890', 'C-302', 'C Wing', 'Chartered Accountant', 'Active', 'resident'),
('Neha Gupta', 'neha@society.com', 'resident123', '9845678901', 'A-405', 'A Wing', 'Doctor', 'Active', 'resident');

-- 3. Default Security Personnel (password:sachin@123)
INSERT INTO security (name, email, password, phone, badge_number, shift, status, role) VALUES
('Rajesh Kumar', 'security@society.com', 'security123', '9711223344', 'SEC-001', 'Morning', 'On Duty', 'security'),
('Vikram Singh', 'vikram@society.com', 'security123', '9722334455', 'SEC-002', 'Night', 'Active', 'security');

-- 4. Sample Visitors
INSERT INTO visitors (visitor_name, mobile_number, flat_number, resident_name, purpose, date, entry_time, exit_time, status, recorded_by_security_id) VALUES
('Sunil Mehta', '9988776655', 'A-101', 'Rahul Sharma', 'Delivery (Amazon)', CURDATE(), '09:30:00', '09:45:00', 'Left', 1),
('Kiran Rao', '9977665544', 'B-204', 'Priya Verma', 'Personal Visit', CURDATE(), '10:15:00', NULL, 'Inside', 1),
('Deepak Joshi', '9966554433', 'C-302', 'Amitabh Patel', 'AC Maintenance', CURDATE(), '11:00:00', NULL, 'Inside', 1),
('Anil Kapoor', '9955443322', 'A-405', 'Neha Gupta', 'Guest Visit', CURDATE() - INTERVAL 1 DAY, '14:00:00', '18:30:00', 'Left', 1);

-- 5. Sample Complaints
INSERT INTO complaints (resident_id, flat_number, title, category, description, priority, status, admin_remarks) VALUES
(1, 'A-101', 'Water Leakage in Main Washroom', 'Plumbing', 'Water seepage coming from upper floor in master bedroom washroom.', 'High', 'In Progress', 'Plumber assigned for inspection today at 4 PM.'),
(2, 'B-204', 'Elevator B-Wing Making Noise', 'Maintenance', 'The lift in B wing produces a squeaky sound while moving between 2nd and 3rd floors.', 'Medium', 'Pending', NULL),
(3, 'C-302', 'Street Light Near C-Wing Gate Blinking', 'Electrical', 'Outside street light blinking constantly at night creating dark spot near parking.', 'Low', 'Resolved', 'Replaced bulb with new LED fixture.');

-- 6. Sample Maintenance Bills
INSERT INTO maintenance (resident_id, flat_number, month_year, amount, due_date, status, payment_date, payment_method) VALUES
(1, 'A-101', 'August 2026', 3500.00, '2026-08-15', 'Unpaid', NULL, NULL),
(2, 'B-204', 'August 2026', 3500.00, '2026-08-15', 'Paid', '2026-08-01', 'UPI / Online'),
(3, 'C-302', 'August 2026', 4000.00, '2026-08-15', 'Unpaid', NULL, NULL),
(4, 'A-405', 'August 2026', 3500.00, '2026-08-15', 'Paid', '2026-07-31', 'Net Banking');

-- 7. Sample Notices
INSERT INTO notices (title, category, content, priority, posted_by, date_posted) VALUES
('Annual General Body Meeting (AGM)', 'Event', 'All residents are invited to attend the Annual General Meeting on Sunday, 10th August at 5:00 PM in the Society Clubhouse.', 'Urgent', 'Society Secretary', CURDATE()),
('Water Tank Cleaning Schedule', 'Maintenance', 'Water supply will be temporarily shut down on Thursday from 10 AM to 2 PM for overhead tank cleaning.', 'Important', 'Estate Manager', CURDATE() - INTERVAL 2 DAY),
('Independence Day Flag Hoisting', 'Celebration', 'Join us with your families for Independence Day celebrations on August 15th at 8:30 AM at Central Lawn followed by high tea.', 'General', 'Cultural Committee', CURDATE() - INTERVAL 4 DAY);

-- 8. Sample Emergency Contacts
INSERT INTO emergency_contacts (name, designation, phone, category) VALUES
('Main Security Gate Desk', 'Chief Security Officer', '022-28490011 / 9711223344', 'Security'),
('Society Office Administrator', 'Property Manager', '022-28490000', 'Essential'),
('Local Police Station (Powai)', 'Emergency Response', '100 / 022-25700200', 'Security'),
('City Emergency Ambulance', 'Medical Helpline', '108 / 9820011223', 'Medical'),
('On-Call Electrician (Suresh)', 'Electrical Specialist', '9819001122', 'Maintenance'),
('On-Call Plumber (Ramesh)', 'Plumbing Specialist', '9819003344', 'Maintenance');
