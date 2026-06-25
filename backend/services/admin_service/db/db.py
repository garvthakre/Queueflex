import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from config.config import DATABASE_URL

@contextmanager
def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS services (
                service_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                max_capacity INTEGER DEFAULT 50,
                estimated_time_per_person INTEGER DEFAULT 15,
                status TEXT DEFAULT 'active',
                created_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("[DB] Services table initialized")

def create_service(service):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO services (
                service_id, name, description, category,
                max_capacity, estimated_time_per_person, status, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            service['service_id'],
            service['name'],
            service['description'],
            service['category'],
            service['max_capacity'],
            service['estimated_time_per_person'],
            service['status'],
            service['created_by']
        ))
        return service

def get_all_services():
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute('SELECT * FROM services ORDER BY created_at DESC')
        return [dict(row) for row in cursor.fetchall()]

def get_service_by_id(service_id):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute('SELECT * FROM services WHERE service_id = %s', (service_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def update_service(service_id, updates):
    if not updates:
        return get_service_by_id(service_id)

    set_clause = ', '.join([f"{key} = %s" for key in updates.keys()])
    values = list(updates.values()) + [service_id]

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            f'UPDATE services SET {set_clause} WHERE service_id = %s',
            values
        )
        if cursor.rowcount == 0:
            raise Exception("Service not found")
        return get_service_by_id(service_id)

def delete_service(service_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM services WHERE service_id = %s', (service_id,))
        if cursor.rowcount == 0:
            raise Exception("Service not found")
        return True