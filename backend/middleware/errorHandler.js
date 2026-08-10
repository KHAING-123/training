// エラーを一箇所に集約して JSON 形式で返すミドルウェア
// 各ルートは try/catch で next(err) するだけでよく、レスポンス整形の責務を持たない
export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Not Found: ${req.method} ${req.originalUrl}`,
    },
  });
}
