
-- Insertion des données dans la table weapon_types
INSERT INTO weapon_types (name, description) VALUES
('Sniper', 'Arme à longue portée, idéale pour éliminer des cibles à distance avec précision.'),
("Fusil d\'assaut", 'Arme polyvalente, adaptée aux combats à moyenne portée.'),
('Lame', 'Arme de mêlée silencieuse, efficace au corps à corps.'),
('Fusil à pompe', 'Arme puissante à courte portée, infligeant de lourds dégâts.'),
('Arme de poing', 'Arme secondaire légère, utilisée comme solution de secours.');

-- Insertion des données dans la table weapons
INSERT INTO weapons (name, weapon_type_id, magazine_size, damage, weight, reload_time, weapons.range, fire_rate) VALUES
('Barrett M82', 1, 10, 90, 14.0, 3.5, 75, 0.3),
('Dragunov SVD', 1, 10, 75, 4.3, 2.8, 65,0.8),
('AK-47', 2, 30, 50, 4.3, 2.4, 55, 9),
('M4A1', 2, 30, 45, 3.1, 2.0, 60, 12),
('Couteau tactique', 3, 0, 25, 0.4, 0.0, 1, 1.2),
('Katana cybernétique', 3, 0, 40, 1.2, 0.0, 2, 0.9),
('SPAS-12', 4, 8, 70, 4.2, 3.0, 20, 1),
('Mossberg 500', 4, 6, 65, 3.6, 2.8, 18, 0.8),
('Glock 17', 5, 17, 25, 0.9, 1.5, 35, 0.6),
('Desert Eagle', 5, 7, 60, 1.8, 2.2, 30, 2);
