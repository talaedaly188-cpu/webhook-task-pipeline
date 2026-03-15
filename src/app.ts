import express from "express";
import { healthRouter } from "./routes/health.route";
import { pipelineRouter } from "./modules/pipelines/pipeline.routes";

export const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/pipelines", pipelineRouter);
