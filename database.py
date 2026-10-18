import sqlite3

class Database:
    def __init__(self, db_name='tasks.db'):
        self.conn = sqlite3.connect(db_name, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.create_table()
        self.migrate()

    def create_table(self):
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT DEFAULT '工作',
                priority TEXT DEFAULT '中',
                deadline TEXT,
                status TEXT DEFAULT '待完成',
                notes TEXT DEFAULT '',
                reminder TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()

    def migrate(self):
        cursor = self.conn.execute("PRAGMA table_info(tasks)")
        columns = [row['name'] for row in cursor.fetchall()]
        if 'notes' not in columns:
            self.conn.execute("ALTER TABLE tasks ADD COLUMN notes TEXT DEFAULT ''")
        if 'reminder' not in columns:
            self.conn.execute("ALTER TABLE tasks ADD COLUMN reminder TEXT DEFAULT ''")
        self.conn.commit()

    def get_all_tasks(self):
        cursor = self.conn.execute('SELECT * FROM tasks ORDER BY created_at DESC')
        return [dict(row) for row in cursor.fetchall()]

    def get_task(self, task_id):
        cursor = self.conn.execute('SELECT * FROM tasks WHERE id=?', (task_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    def create_task(self, title, category, priority, deadline, notes='', reminder=''):
        cursor = self.conn.execute(
            'INSERT INTO tasks (title, category, priority, deadline, notes, reminder) VALUES (?, ?, ?, ?, ?, ?)',
            (title, category, priority, deadline, notes, reminder)
        )
        self.conn.commit()
        return cursor.lastrowid

    def update_task(self, task_id, title, category, priority, deadline, status, notes='', reminder=''):
        self.conn.execute(
            'UPDATE tasks SET title=?, category=?, priority=?, deadline=?, status=?, notes=?, reminder=? WHERE id=?',
            (title, category, priority, deadline, status, notes, reminder, task_id)
        )
        self.conn.commit()

    def delete_task(self, task_id):
        self.conn.execute('DELETE FROM tasks WHERE id=?', (task_id,))
        self.conn.commit()

    def update_status(self, task_id, status):
        self.conn.execute('UPDATE tasks SET status=? WHERE id=?', (status, task_id))
        self.conn.commit()

    def get_due_reminders(self, now_str):
        cursor = self.conn.execute(
            "SELECT * FROM tasks WHERE reminder != '' AND reminder <= ? AND status != '已完成' ORDER BY reminder",
            (now_str,)
        )
        return [dict(row) for row in cursor.fetchall()]
