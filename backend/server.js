import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/tasks.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // フロント(別ポート)からのアクセスを許可
app.use(express.json()); // JSON ボディを req.body でパースする

app.use('/api/tasks', taskRoutes);

app.use(notFoundHandler); // どのルートにも一致しなかった場合
app.use(errorHandler); // 4つ引数のミドルウェア = エラーハンドラとして最後に登録

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
