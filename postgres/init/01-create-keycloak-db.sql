-- Runs ONCE on the very first initialization of the postgres data volume.
-- Creates the separate database used by Keycloak. The app's own database
-- (POSTGRES_DB, default "taskmanager") is auto-created by the postgres image.
--
-- Re-runs only after `docker compose down -v` (which wipes the volume).
CREATE DATABASE keycloak;
