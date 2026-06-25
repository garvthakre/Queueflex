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
            CREATE TABLE IF NOT EXISTS queue_items (
                queue_id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                service_id TEXT NOT NULL,
                name TEXT NOT NULL,
                purpose TEXT,
                serviceType TEXT,
                position INTEGER,
                status TEXT DEFAULT 'waiting',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("[DB] Queue items table initialized")

def recalculate_positions(service_id):
    if not service_id:
        return
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute('''
            SELECT queue_id FROM queue_items
            WHERE service_id = %s AND status = 'waiting'
            ORDER BY created_at ASC
        ''', (service_id,))
        rows = cursor.fetchall()
        for idx, row in enumerate(rows):
            cursor.execute(
                'UPDATE queue_items SET position = %s WHERE queue_id = %s',
                (idx + 1, row['queue_id'])
            )

def get_queue_count_for_service(service_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT COUNT(*) FROM queue_items
            WHERE service_id = %s AND status = 'waiting'
        ''', (service_id,))
        return cursor.fetchone()[0]

def add_queue_item(item):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO queue_items (
                queue_id, user_id, service_id, name,
                purpose, serviceType, position, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            item['queue_id'],
            item['user_id'],
            item['service_id'],
            item['name'],
            item['purpose'],
            item['serviceType'],
            item['position'],
            item['status']
        ))

def get_all_queue_items():
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute('SELECT * FROM queue_items ORDER BY created_at ASC')
        return [dict(row) for row in cursor.fetchall()]

def get_user_queue_items(user_id):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            'SELECT * FROM queue_items WHERE user_id = %s ORDER BY created_at ASC',
            (user_id,)
        )
        return [dict(row) for row in cursor.fetchall()]

def get_service_queue_items(service_id, include_all_statuses=False):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if include_all_statuses:
            cursor.execute(
                'SELECT * FROM queue_items WHERE service_id = %s ORDER BY created_at ASC',
                (service_id,)
            )
        else:
            cursor.execute('''
                SELECT * FROM queue_items
                WHERE service_id = %s AND status = 'waiting'
                ORDER BY created_at ASC
            ''', (service_id,))
        return [dict(row) for row in cursor.fetchall()]

def get_queue_item_by_id(queue_id):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            'SELECT * FROM queue_items WHERE queue_id = %s',
            (queue_id,)
        )
        row = cursor.fetchone()
        return dict(row) if row else None

def update_queue_item(queue_id, updates):
    if not updates:
        return get_queue_item_by_id(queue_id)

    set_clause = ', '.join([f"{key} = %s" for key in updates.keys()])
    values = list(updates.values()) + [queue_id]

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            f'UPDATE queue_items SET {set_clause} WHERE queue_id = %s',
            values
        )
    return get_queue_item_by_id(queue_id)

def remove_queue_item(item):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'DELETE FROM queue_items WHERE queue_id = %s',
            (item['queue_id'],)
        )
        return cursor.rowcount > 0