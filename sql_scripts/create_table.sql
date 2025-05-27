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

CREATE TABLE IF NOT EXISTS "images" (
    "id" SERIAL,
    "image_path" TEXT NOT NULL,
    "dog_id" INT DEFAULT NULL,
    "runner_id" INT DEFAULT NULL,
    "created_at" TIMESTAMP DEFAULT now(),
    CONSTRAINT "images_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "images_fkey_runnerid_id" FOREIGN KEY ("runner_id") REFERENCES "runners"("id"),
    CONSTRAINT "images_fkey_dogid_id" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id"),
    CHECK (
        ("dog_id" IS NOT NULL AND "runner_id" IS NULL)
        OR
        ("dog_id" IS NULL AND "runner_id" IS NOT NULL)
    )
);


CREATE TABLE IF NOT EXISTS "sports"(
    "id" SERIAL,
    "name" VARCHAR(50),
    "type" VARCHAR (50), -- dryland or on-snow
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
    "activity_id" INTEGER, -- think about adding a constraint so workout must be true in activity table
    "lap_number" INTEGER,
    "lap_distance" FLOAT,
    "lap_time" INTERVAL,
    "speed" FLOAT,
    CONSTRAINT "workout_laps_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workoutlaps_fkey_activityid_id" FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
);

CREATE TABLE IF NOT EXISTS "weather_entries" (
    "id" SERIAL,
    "activity_id" INTEGER,
    "temperature" FLOAT,
    "humidity" FLOAT,
    "condition" TEXT, -- weather description sunny, cloudy etc...
    CONSTRAINT "weather_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "weather_fkey_activityid_id" FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
);

CREATE TABLE IF NOT EXISTS "weight_entries" (
    "id" SERIAL,
    "dog_id" INTEGER,
    "date" DATE,
    "weight" FLOAT,
    CONSTRAINT "weight_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "weightentries_fkey_dogid_id" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id")
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL,
    "username" TEXT NOT NULL,
    "kennel_id" INT,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "is_active" BOOLEAN DEFAULT true, -- allows to disable a user if needed
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "unique_active_username" ON users(username) WHERE is_active=true; 

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "user_id" INT,
    "hashed_refresh_token" TEXT,
    "expires_on" TIMESTAMPTZ NOT NULL, --expiry date for refresh token
    CONSTRAINT "refrehs_tokens_pkey" PRIMARY KEY ("user_id", "hashed_refresh_token"),
    CONSTRAINT "refresh_rokens_fkey_userid_id" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- Create function to enfore a maximum number of active session for a user
CREATE OR REPLACE FUNCTION enforce_token_limit()
RETURNS TRIGGER AS $$
BEGIN
 IF (
 SELECT COUNT(*)
    FROM refresh_tokens
    WHERE user_id = NEW.user_id
  ) >= 3 THEN
    DELETE FROM refresh_tokens
    WHERE ctid IN (
      SELECT ctid
      FROM refresh_tokens
      WHERE user_id = NEW.user_id
      ORDER BY expires_on ASC
      LIMIT 1
    );
  END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_enforce_token_limit
BEFORE INSERT ON refresh_tokens
FOR EACH ROW
EXECUTE FUNCTION enforce_token_limit();