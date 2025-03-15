import psycopg2

def get_connection(conn_string: str) -> psycopg2.extensions.connection:
    psycopg2.connect(conn_string)