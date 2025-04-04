INSERT INTO "kennels"
VALUES 
    (1, 'Test Kennel'),
    (2, 'Les Gaulois');

INSERT INTO "dogs"("name", "date_of_birth", "breed", "kennel_id")
VALUES
    ('Milou', '2023-01-01', 'Terrier', 2),
    ('Fido', '2020-07-01', 'Golden Retriever', 2),
    ('Idefix', '2022-04-01', 'Terrier', 1);

INSERT INTO "runners"("name", "kennel_id")
VALUES
    ('Tintin', 1),
    ('Obelix', 2),
    ('Asterix', 2);

INSERT INTO sports ("name", "description")
VALUES 
    ('Canicross', 'Running with your dog'),
    ('Bikejoring', 'Biking with your dog');

-- Insert into activities
INSERT INTO activities (
    runner_id, sport_id, timestamp, notes, location, workout, speed, distance
) VALUES (
    2, 1, '2025-04-01T09:30:00Z', 'Morning speed workout', 'Forest Loop', true, 20.3, 8.0
) RETURNING id;
-- Assume returned id is 1

-- Insert into activity_dogs
INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(1, 1, 9),
(1, 2, 8);

-- Insert into workout_laps
INSERT INTO workout_laps (activity_id, lap_number, speed) VALUES 
(1, 1, 21.0),
(1, 2, 20.1),
(1, 3, 19.8);

-- Activity 2 (same runner)
INSERT INTO activities (
    runner_id, sport_id, timestamp, notes, location, workout, speed, distance
) VALUES (
    2, 1, '2025-04-02T16:00:00Z', 'Easy recovery jog', 'City Park', false, 12.5, 3.2
) RETURNING id;
-- Assume activity_id = 2

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(2, 1, 7);

-- Activity 3 (different runner)
INSERT INTO activities (
    runner_id, sport_id, timestamp, notes, location, workout, speed, distance
) VALUES (
    1, 2, '2025-04-03T08:15:00Z', 'Morning bike', 'Mountain Trail', false, 19.2, 5.5
) RETURNING id;
-- Assume activity_id = 3

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(3, 1, 8);
