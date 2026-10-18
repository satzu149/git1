# 项目一：在线任务管理系统

## 项目简介
一个基于Web的个人任务管理系统，帮助用户创建、管理和追踪待办事项。支持任务分类、优先级、多行备注、定时提醒、今日推荐歌曲等个性化功能。

## 技术栈
- **前端**: HTML5 + CSS3 + JavaScript
- **后端**: Python Flask
- **数据库**: SQLite
- **API**: RESTful API

## 功能特性
1. 创建、编辑、删除任务（弹窗编辑）
2. 任务分类（工作、学习、生活）
3. 优先级设置（高、中、低）
4. 截止日期设置
5. 任务状态追踪（待完成、进行中、已完成）
6. **多行备注**：每个任务可输入详细的多行备注内容
7. **定时提醒**：为任务设置提醒时间，页面轮询检测，到点弹出通知并响铃
8. **今日推荐歌曲**：基于网易云歌单（803首），每天根据日期随机推荐一首
9. 数据持久化存储（旧数据库自动迁移新字段）

## 项目结构
```
1-TaskManager/
├── app.py               # Flask后端主程序
├── requirements.txt     # Python依赖
├── database.py          # 数据库操作（含字段迁移）
├── fetch_playlist.py    # 网易云歌单数据抓取脚本
├── tasks.db             # SQLite数据库（不提交到Git）
├── static/
│   ├── css/style.css    # 样式文件
│   ├── js/main.js       # 前端JavaScript
│   └── data/songs.json  # 歌曲库数据
└── templates/
    └── index.html       # 主页面
```

## 快速开始

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 运行程序
```bash
python app.py
```

### 3. 访问应用
打开浏览器访问: http://localhost:5000

### 4. （可选）更新歌曲库
```bash
python fetch_playlist.py
```

## API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 获取全部任务 |
| POST | /api/tasks | 创建任务 |
| PUT | /api/tasks/<id> | 更新任务 |
| DELETE | /api/tasks/<id> | 删除任务 |
| PATCH | /api/tasks/<id>/status | 更新状态 |
| GET | /api/reminders?now=... | 获取到期提醒 |
| GET | /api/music/today | 今日推荐歌曲 |

## 学到的知识点
1. **Web开发**: HTTP请求/响应、RESTful API设计
2. **数据库**: SQL语句、CRUD操作、ALTER TABLE字段迁移
3. **前后端分离**: AJAX请求、JSON数据处理
4. **Python Flask**: 路由、模板渲染、跨线程SQLite连接
5. **版本控制**: Git与GitHub协作

## 适合简历描述
"开发了一个基于Flask的Web任务管理系统，实现了任务CRUD、多行备注、定时提醒（浏览器通知+轮询检测）、分类管理，以及基于日期种子的每日歌曲推荐功能。使用SQLite存储数据并支持平滑迁移，采用RESTful API设计规范，通过Git进行版本管理并托管于GitHub。"
