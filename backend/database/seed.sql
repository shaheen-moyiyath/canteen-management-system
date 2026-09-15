-- =======================================================
-- Seed Data for Canteen Ordering System
-- Database: canteen_db
-- =======================================================

USE canteen_db;

-- 1. Insert Initial Users
-- Passwords:
-- 'admin123'    -> $2a$10$tWAkMbXYRk9/VcOV7SB3qOq.1efAmfGcLqtx0AsNK5927.4oJGhGW
-- 'student123'  -> $2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.

INSERT INTO users (name, college_id, password, role) VALUES
('Canteen Administrator', 'ADMIN01', '$2a$10$tWAkMbXYRk9/VcOV7SB3qOq.1efAmfGcLqtx0AsNK5927.4oJGhGW', 'admin'),
('Muhammed Shaheen M', 'AZAYSCS032', '$2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.', 'student'),
('Sainul Ashiqu N', 'AZAYSCS043', '$2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.', 'student'),
('Rayan Ramzan Kollappatta', 'AZAYSCS038', '$2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.', 'student'),
('Muhammed Nihal NK', 'AZAYSCS029', '$2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.', 'student'),
('Sinan Khan K', 'AZAYSCS049', '$2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.', 'student'),
('Naseeb Rahman NT', 'AZAYSCS035', '$2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.', 'student')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Insert Menu Items
INSERT INTO menu_items (name, description, price, is_available) VALUES
('Veg Thali Meals', 'Authentic South Indian lunch served with rice, sambar, rasam, avial, thoran, pickle & papad', 70.00, 1),
('Malabar Chicken Biryani', 'Fragrant kaima rice dum biryani cooked with tender spiced chicken, egg, raita & pickle', 130.00, 1),
('Ghee Rice & Chicken Curry', 'Aromatic roasted ghee rice served with rich spicy Malabar chicken gravy', 120.00, 1),
('Fish Curry Meals', 'Traditional Kerala red fish curry meal served with hot steamed rice and sides', 95.00, 1),
('Egg Fried Rice & Chilli Sauce', 'Wok-tossed rice with fresh farm eggs, vegetables and spring onion', 90.00, 1),
('Kerala Parotta (2 pcs) with Beef Curry', 'Layered flaky Malabar parottas served with tender slow-cooked spicy beef roast', 110.00, 1),
('Fresh Lime Juice', 'Refreshing chilled sweet and salted fresh mint lime juice', 25.00, 1),
('Hot Masala Tea & Parippuvada', 'Strong cardamom tea served with traditional crispy lentil fritter', 20.00, 1);
