import { Router } from "express";
import { checkDatabaseConnection } from "../db";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "webhook-task-pipeline"
  });
});

healthRouter.get("/db", async (_req, res) => {
  try {
    await checkDatabaseConnection();

    res.status(200).json({
      status: "ok",
      database: "connected"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    res.status(500).json({
      status: "error",
      database: "disconnected",
      message
    });
  }
});
