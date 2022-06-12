#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER portfolio WITH SUPERUSER PASSWORD 'portfolio';
	CREATE DATABASE portfolio;
	GRANT ALL PRIVILEGES ON DATABASE portfolio TO portfolio;
EOSQL