CREATE TABLE IF NOT EXISTS "kennels" (
    "id" SERIAL,
    "name" VARCHAR(100) UNIQUE,
    CONSTRAINT "kennels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "dogs" (
    "id" SERIAL,
    "name" VARCHAR(100),
    "date_of_birth" DATE,
    "breed" VARCHAR(50),
    "kennel_id" INTEGER,
    CONSTRAINT "dogs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dogs_fkey_kennelid_id" FOREIGN KEY ("kennel_id") REFERENCES "kennels"("id"),
    UNIQUE("name","kennel_id")
);

CREATE TABLE IF NOT EXISTS "runners" (
    "id" SERIAL,
    "name" VARCHAR(100),
    "kennel_id" INTEGER,
    CONSTRAINT "runnners_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "runners_fkey_kennelid_id" FOREIGN KEY ("kennel_id") REFERENCES "kennels"("id"),
    UNIQUE("name","kennel_id")
);

CREATE TABLE IF NOT EXISTS "sports"(
    "id" SERIAL,
    "name" VARCHAR(50),
    "description" TEXT,
    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "activities"(
    "id" SERIAL,
    "runner_id" INTEGER,
    "sport_id" INTEGER,
    "timestamp" TIMESTAMPTZ,
    "notes" TEXT, -- comments on the training activity
    "location" VARCHAR(100), -- this could be a GPS coordinate in the future
    "workout" BOOLEAN, -- set to true if this was a speed workout (intervals)
    "speed" FLOAT, -- only save speed as it can always be converted to pace
    "distance" FLOAT, -- training distance in km
    CONSTRAINT "activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activities_fkey_runnerid_id" FOREIGN KEY ("runner_id") REFERENCES "runners"("id"),
    CONSTRAINT "activities_fkey_sportid_id" FOREIGN KEY ("sport_id") REFERENCES "sports"("id")
);

CREATE TABLE IF NOT EXISTS "activity_dogs"(
    "id" SERIAL,
    "activity_id" INTEGER,
    "dog_id" INTEGER,
    "rating" INTEGER, -- out of 10 rating for the dog performance
    CONSTRAINT "activity_dog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activitydogs_fkey_activityid_id" FOREIGN KEY ("activity_id") REFERENCES "activities"("id"),
    CONSTRAINT "activitydogs_fley_dogid_id" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id")
);

CREATE TABLE IF NOT EXISTS "workout_laps" (
    "id" SERIAL,
    "activity_id"INTEGER, -- think about adding a constraint so workout must be true in activity table
    "lap_number" INTEGER,
    "speed" FLOAT,
    CONSTRAINT "workout_laps_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workoutlaps_fkey_activityid_id" FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
);

CREATE TABLE IF NOT EXISTS "weight_entries" (
    "id" SERIAL,
    "dog_id" INTEGER,
    "date" DATE,
    "weight" FLOAT,
    CONSTRAINT "weight_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "weightentries_fkey_dogid_id" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id")
);