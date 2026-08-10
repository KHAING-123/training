import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data/tasks.json');

const router = Router();

// tasks.json を読み込んで配列として返す
async function readTasks() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// 配列を tasks.json に書き戻す
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

function notFoundError(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function badRequestError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// GET /api/tasks - 一覧取得
router.get('/', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id - 1件取得
router.get('/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) throw notFoundError(`Task ${req.params.id} not found`);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - 新規作成
router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (typeof title !== 'string' || !title.trim()) {
      throw badRequestError('title is required');
    }

    const tasks = await readTasks();
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id - 更新（タイトル / 完了状態）
router.put('/:id', async (req, res, next) => {
  try {
    const { title, done } = req.body;
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      throw badRequestError('title must not be empty');
    }
    if (done !== undefined && typeof done !== 'boolean') {
      throw badRequestError('done must be boolean');
    }

    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw notFoundError(`Task ${req.params.id} not found`);

    if (title !== undefined) tasks[index].title = title.trim();
    if (done !== undefined) tasks[index].done = done;
    await writeTasks(tasks);

    res.json(tasks[index]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id - 削除
router.delete('/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw notFoundError(`Task ${req.params.id} not found`);

    const [deleted] = tasks.splice(index, 1);
    await writeTasks(tasks);

    res.json(deleted);
  } catch (err) {
    next(err);
  }
});

export default router;
