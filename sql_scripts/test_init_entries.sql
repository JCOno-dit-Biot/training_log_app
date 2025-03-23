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
    ('Obelix', 2);