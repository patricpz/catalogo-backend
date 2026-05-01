import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.statusCode,
      error_code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: true,
      message: "Dados inválidos",
      code: 400,
      issues: err.flatten(),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: true,
        message: "Arquivo excede o tamanho máximo permitido (5 MiB).",
        code: 400,
        error_code: "FILE_TOO_LARGE",
      });
      return;
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        error: true,
        message: 'Use o campo de arquivo "image".',
        code: 400,
        error_code: "UNEXPECTED_FIELD",
      });
      return;
    }
    res.status(400).json({ error: true, message: err.message, code: 400, error_code: err.code });
    return;
  }

  console.error(err);
  res.status(500).json({ error: true, message: "Erro interno do servidor", code: 500 });
};
