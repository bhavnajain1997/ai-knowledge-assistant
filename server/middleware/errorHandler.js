export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message);
  if (process.env.NODE_ENV !== "production") console.error(err.stack);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
}
