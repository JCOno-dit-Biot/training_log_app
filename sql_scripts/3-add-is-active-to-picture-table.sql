ALTER TABLE images
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX unique_active_dog_image ON images(dog_id) WHERE is_active;
CREATE UNIQUE INDEX unique_active_runner_image ON images(runner_id) WHERE is_active;

ALTER TABLE images
    DROP CONSTRAINT images_fkey_runnerid_id,
    DROP CONSTRAINT images_fkey_dogid_id,
    ADD CONSTRAINT images_fkey_runnerid_id
    FOREIGN KEY (runner_id) REFERENCES runners(id) ON DELETE CASCADE,
    ADD CONSTRAINT images_fkey_dogid_id
    FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE;

