INSERT INTO "kennels" ("name")
VALUES 
    ('Test Kennel'),
    ('Les Gaulois');

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

INSERT INTO sports ("name", "description", "type")
VALUES 
    ('Canicross', 'Running with your dog', 'dryland'),
    ('Bikejoring', 'Biking with your dog', 'on-snow');


-- insert runner pictures path
INSERT INTO "images" ("runner_id","image_path")
VALUES
    (1, 'runner1.jpg'),
    (2, 'runner2.jpg');

-- insert runner pictures path
INSERT INTO "images" ("dog_id", "image_path")
VALUES
    (1, 'dog1.jpg'),
    (2, 'dog2.jpg'),
    (3, 'dog3.jpg');

-- insert image as "old" to check if query gets latest
INSERT INTO "images" ( "dog_id", "image_path", "created_at")
VALUES
    (3, 'dog3-old.jpg', '2024-11-01T12:00:00');

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
INSERT INTO workout_laps (activity_id, lap_number, lap_time, lap_distance, speed) VALUES 
(1, 1, INTERVAL '5 minutes 50 seconds', 2, 20.57),
(1, 2, INTERVAL '1 minutes 25 seconds', 0.5, 21.18),
(1, 3, INTERVAL '3 minutes 3 seconds', 1, 19.67);

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

INSERT INTO weather_entries (activity_id, temperature, humidity, condition)
VALUES 
    (1, 10.4, 0.67, 'sunny'),
    (2, 1.4, NULL, NULL);

-- add weight entries
INSERT INTO weight_entries(
    dog_id, date, weight
) VALUES 
    (1, '2025-01-02', 20.3),
    (1, '2025-02-01' , 21.2),
    (1, '2025-03-05', 19.8),
    (2, '2025-01-03', 40.4);
