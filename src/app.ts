import express from "express";
import { healthRouter } from "./routes/health.route";
import { pipelineRouter } from "./modules/pipelines/pipeline.routes";
import { subscriberRouter } from "./modules/subscribers/subscriber.routes";
import { webhookRouter } from "./modules/webhooks/webhook.routes";
import { jobRouter } from "./modules/jobs/job.routes";

export const app = express();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    }
  })
);
app.use("/health", healthRouter);
app.use("/pipelines", pipelineRouter);
app.use("/", subscriberRouter);
app.use("/webhooks", webhookRouter);
app.use("/jobs", jobRouter);
