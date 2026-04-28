BEGIN;

CREATE TABLE IF NOT EXISTS activity_dog_heat_observations (
    activity_dog_id INTEGER,
    cooling_method TEXT,
    CONSTRAINT "activity_dog_heat_observations_pkey" PRIMARY KEY ("activity_dog_id"),
    CONSTRAINT "activity_dog_heat_observations_fkey_activitydogid_id" FOREIGN KEY ("activity_dog_id") REFERENCES "activity_dogs"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_dog_temperature_measurements (
    id SERIAL,
    activity_dog_id INTEGER NOT NULL,
    phase TEXT NOT NULL,
    recovery_minute INTEGER,
    temperature_c NUMERIC(4,2) NOT NULL,
    measurement_method TEXT,

    CONSTRAINT activity_dog_temp_phase_chk
        CHECK (phase IN ('before', 'after', 'recovery')),

    CONSTRAINT activity_dog_temp_recovery_chk
        CHECK (
            (phase IN ('before', 'after') AND recovery_minute IS NULL)
            OR
            (phase = 'recovery' AND recovery_minute IS NOT NULL AND recovery_minute >= 0)
        ),

    CONSTRAINT "activity_dog_temperature_measurements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activity_dog_temperature_measurements_fkey_activitydogid_id" FOREIGN KEY ("activity_dog_id") REFERENCES "activity_dogs"("id") ON DELETE CASCADE

);

CREATE UNIQUE INDEX IF NOT EXISTS uq_activity_dog_temp_phase_once
ON activity_dog_temperature_measurements (activity_dog_id, phase, recovery_minute);

CREATE UNIQUE INDEX IF NOT EXISTS uq_activity_dog_entry_per_dog
ON activity_dogs (activity_id, dog_id);

COMMIT;