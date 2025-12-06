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

INSERT INTO sports ("name", "description", "type", "display_mode")
VALUES 
    ('Canicross', 'Running with your dog', 'dryland', 'pace'),
    ('Bikejoring', 'Biking with your dog', 'dryland', 'speed'),
    ('Sled', 'Dog sledding', 'on-snow', 'speed');


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

-- add users as it is needed as a foreign key
INSERT INTO users(username, password_hash, kennel_id) VALUES ('john@domain.com', 'hashpassword', 1);
INSERT INTO users(username, password_hash, kennel_id) VALUES ('john_doe@domain.com', 'bad_hashpassword', 1);

-- Insert locations
INSERT INTO activity_locations (name, kennel_id, latitude, longitude) VALUES
    ('Forest Loop',1, 53.5501, -113.469), 
    ('City park',1, 53.5001, -114.469),
    ('Mountain Trail',2, 52.5501, -112.469);

-- Insert into activities
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-04-01T09:30:00Z', 1, true, 20.3, 8.0
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
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-04-02T16:00:00Z', 2, false, 12.5, 3.2
) RETURNING id;
-- Assume activity_id = 2

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(2, 1, 7);

-- Activity 3 (different runner)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    1, 2, '2025-04-03T08:15:00Z', 3, false, 19.2, 5.5
) RETURNING id;
-- Assume activity_id = 3

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(3, 1, 8);

-- Activity 4 (zero distance, still a workout)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-04-04T07:00:00Z', 1, true, NULL, 0
) RETURNING id;
-- Assume id = 4

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(4, 2, 5);

-- Activity 5 (long distance, multiple dogs, non-workout)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-04-05T14:45:00Z', 1, false, 16.8, 12.3
) RETURNING id;
-- Assume id = 5

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(5, 1, 9),
(5, 2, 6);


-- Activity 6 (on-snow sport)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    1, 3, '2025-04-06T10:00:00Z', 3, false, 18.4, 7.0
) RETURNING id;
-- Assume id = 6

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(6, 1, 8);

-- Activity 7 (same day as Activity 2 but morning)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-04-02T09:00:00Z', 2, false, 10.4, 2.1
) RETURNING id;
-- Assume id = 7

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(7, 2, 7);

-- Activity 8 (same day as Activity 2 but different kennel)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-04-02T09:00:00Z', 2, false, 10.4, 2.1
) RETURNING id;
-- Assume id = 8

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(8, 3, 7);

-- Activity 9 (same day as Activity 2 but different kennel)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-05-02T09:00:00Z', 2, false, 10.4, 2.1
) RETURNING id;
-- Assume id = 9

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(9, 1, 7);

-- Activity 10 (same dogs and kennel 2 but following week)
INSERT INTO activities (
    runner_id, sport_id, timestamp, location_id, workout, speed, distance
) VALUES (
    2, 1, '2025-04-10T09:00:00Z', 2, false, 10.4, 4.1
) RETURNING id;
-- Assume id = 10

INSERT INTO activity_dogs (activity_id, dog_id, rating) VALUES 
(10, 1, 7),
(10, 2, 8);



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
    (2, '2025-01-03', 40.4),
    (3, '2025-02-02', 5.2),
    (3, '2025-03-02', 6.2),
    (3, '2025-05-02', 5.8);

-- add example activity comments
INSERT INTO  activity_comments (
    activity_id, user_id, comment
) VALUES 
    (1, 1, 'Really solid training'),
    (2, 2, 'Not the best today'),
    (2, 1, 'Lots of wildlife today');
