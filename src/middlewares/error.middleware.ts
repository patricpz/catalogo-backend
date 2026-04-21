import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Dados inválidos",
      issues: err.flatten(),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        message: "Arquivo excede o tamanho máximo permitido (5 MiB).",
        code: "FILE_TOO_LARGE",
      });
      return;
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        message: 'Use o campo de arquivo "image".',
        code: "UNEXPECTED_FIELD",
      });
      return;
    }
    res.status(400).json({ message: err.message, code: err.code });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
};
