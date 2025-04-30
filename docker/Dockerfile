FROM postgres:latest
COPY ../sql_scripts/create_table.sql /docker-entrypoint-initdb.d/1-init.sql
COPY ../data/insertDogRunner.sql/ /docker-entrypoint-initdb.d/2-insert-data.sql
CMD ["docker-entrypoint.sh", "postgres"]

