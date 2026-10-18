document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    loadTodayMusic();
    initReminders();

    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createTask();
    });

    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEdit();
    });

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('加载任务失败:', error);
    }
}

function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><p>还没有任务，快来创建一个吧！</p></div>';
        return;
    }

    taskList.innerHTML = tasks.map(task => {
        const hasNotes = task.notes && task.notes.trim();
        const reminderHtml = task.reminder ? `
            <span class="task-reminder ${isReminderDue(task) ? 'reminder-due' : ''}">
                ⏰ ${formatReminder(task.reminder)}
            </span>` : '';
        const notesHtml = hasNotes ? `
            <div class="task-notes">${escapeHtml(task.notes).replace(/\n/g, '<br>')}</div>` : '';
        return `
        <div class="task-item ${hasNotes ? 'has-notes' : ''}" data-id="${task.id}">
            <div class="task-main">
                <input type="checkbox" ${task.status === '已完成' ? 'checked' : ''}
                       onchange="toggleStatus(${task.id}, this.checked)">
                <span class="task-title">${escapeHtml(task.title)}</span>
                <span class="task-category category-${task.category}">${task.category}</span>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
                <span class="task-status status-${task.status}" onclick="cycleStatus(${task.id}, '${task.status}')">
                    ${task.status}
                </span>
                <span class="task-deadline">${task.deadline || '无截止日期'}</span>
                ${reminderHtml}
                <div class="task-actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal(${task.id})">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
                </div>
            </div>
            ${notesHtml}
        </div>`;
    }).join('');
}

async function createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const deadline = document.getElementById('taskDeadline').value;
    const reminder = document.getElementById('taskReminder').value.replace('T', ' ');
    const notes = document.getElementById('taskNotes').value;

    if (!title) {
        alert('请输入任务标题');
        return;
    }

    try {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, priority, deadline, notes, reminder })
        });
        document.getElementById('taskForm').reset();
        loadTasks();
    } catch (error) {
        console.error('创建任务失败:', error);
    }
}

async function toggleStatus(taskId, checked) {
    const status = checked ? '已完成' : '待完成';
    await updateTaskStatus(taskId, status);
}

async function cycleStatus(taskId, currentStatus) {
    const statusCycle = ['待完成', '进行中', '已完成'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    await updateTaskStatus(taskId, nextStatus);
}

async function updateTaskStatus(taskId, status) {
    try {
        await fetch(`/api/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        loadTasks();
    } catch (error) {
        console.error('更新状态失败:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？')) return;
    try {
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        loadTasks();
    } catch (error) {
        console.error('删除任务失败:', error);
    }
}

async function openEditModal(taskId) {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('editId').value = task.id;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editCategory').value = task.category;
        document.getElementById('editPriority').value = task.priority;
        document.getElementById('editDeadline').value = task.deadline || '';
        document.getElementById('editReminder').value = task.reminder ? task.reminder.replace(' ', 'T') : '';
        document.getElementById('editStatus').value = task.status;
        document.getElementById('editNotes').value = task.notes || '';
        document.getElementById('editModal').style.display = 'flex';
    } catch (error) {
        console.error('加载任务失败:', error);
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const payload = {
        title: document.getElementById('editTitle').value.trim(),
        category: document.getElementById('editCategory').value,
        priority: document.getElementById('editPriority').value,
        deadline: document.getElementById('editDeadline').value,
        reminder: document.getElementById('editReminder').value.replace('T', ' '),
        status: document.getElementById('editStatus').value,
        notes: document.getElementById('editNotes').value
    };
    if (!payload.title) {
        alert('请输入任务标题');
        return;
    }
    try {
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        closeEditModal();
        loadTasks();
    } catch (error) {
        console.error('保存失败:', error);
    }
}

document.getElementById('editModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeEditModal();
});

function isReminderDue(task) {
    if (!task.reminder || task.status === '已完成') return false;
    return new Date(task.reminder.replace(' ', 'T')) <= new Date();
}

function formatReminder(str) {
    return str;
}

// ---- 今日推荐歌曲 ----
async function loadTodayMusic() {
    try {
        const resp = await fetch('/api/music/today');
        const data = await resp.json();
        if (!data.song) return;
        const card = document.getElementById('musicCard');
        document.getElementById('songName').textContent = data.song.name;
        document.getElementById('songArtist').textContent = data.song.artist + ' · ' + data.song.album;
        document.getElementById('songLink').href = data.song.url;
        const pic = document.getElementById('songPic');
        pic.src = data.song.pic || '';
        pic.onerror = function() { pic.style.display = 'none'; };
        card.style.display = 'flex';
    } catch (error) {
        console.error('加载推荐歌曲失败:', error);
    }
}

// ---- 提醒轮询 ----
function initReminders() {
    const notified = new Set();
    async function check() {
        const now = new Date();
        const nowStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        try {
            const resp = await fetch(`/api/reminders?now=${encodeURIComponent(nowStr)}`);
            const items = await resp.json();
            items.forEach(t => {
                if (notified.has(t.id)) return;
                notified.add(t.id);
                notifyRemind(t);
            });
            if (items.length) loadTasks();
        } catch (e) {}
    }
    setInterval(check, 30000);
    check();
}

function notifyRemind(task) {
    const msg = `任务提醒：${task.title}` + (task.notes ? `\n${task.notes.slice(0, 50)}` : '');
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ 任务提醒', { body: msg });
    } else {
        alert('⏰ ' + msg);
    }
    playBeep();
}

function playBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
