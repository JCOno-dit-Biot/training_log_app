ALTER TABLE weather_entries
    ADD CONSTRAINT weather_activity_unique UNIQUE (activity_id);