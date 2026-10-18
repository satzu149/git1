from flask import Flask, render_template, request, jsonify
from datetime import datetime, date
import json
import os
import random
from database import Database

app = Flask(__name__)
db = Database()

SONGS_FILE = os.path.join(os.path.dirname(__file__), 'static', 'data', 'songs.json')

def load_songs():
    if os.path.exists(SONGS_FILE):
        with open(SONGS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = db.get_all_tasks()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    task_id = db.create_task(
        data.get('title', ''),
        data.get('category', '工作'),
        data.get('priority', '中'),
        data.get('deadline', ''),
        data.get('notes', ''),
        data.get('reminder', '')
    )
    return jsonify({'id': task_id, 'message': '任务创建成功'})

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    db.update_task(
        task_id,
        data.get('title', ''),
        data.get('category', '工作'),
        data.get('priority', '中'),
        data.get('deadline', ''),
        data.get('status', '待完成'),
        data.get('notes', ''),
        data.get('reminder', '')
    )
    return jsonify({'message': '任务更新成功'})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    db.delete_task(task_id)
    return jsonify({'message': '任务删除成功'})

@app.route('/api/tasks/<int:task_id>/status', methods=['PATCH'])
def update_status(task_id):
    data = request.json
    db.update_status(task_id, data.get('status', '待完成'))
    return jsonify({'message': '状态更新成功'})

@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    now = request.args.get('now', datetime.now().strftime('%Y-%m-%d %H:%M'))
    reminders = db.get_due_reminders(now)
    return jsonify(reminders)

@app.route('/api/music/today', methods=['GET'])
def today_music():
    songs = load_songs()
    if not songs:
        return jsonify({'song': None})
    seed = date.today().strftime('%Y-%m-%d')
    rng = random.Random(seed)
    song = rng.choice(songs)
    song['url'] = f"https://music.163.com/#/song?id={song['id']}"
    return jsonify({'song': song})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
