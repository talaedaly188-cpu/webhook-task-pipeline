import { Router } from "express";
import { enqueueWebhookJob } from "../jobs/job.service";

export const webhookRouter = Router();

webhookRouter.post("/:sourceKey", async (req, res) => {
  try {
    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : { rawBody: req.body };

    const result = await enqueueWebhookJob(req.params.sourceKey, body);

    if (result.type === "not_found") {
      return res.status(404).json({
        message: "Pipeline not found for this source key"
      });
    }

    if (result.type === "inactive") {
      return res.status(400).json({
        message: "Pipeline is inactive"
      });
    }

    return res.status(202).json({
      message: "Webhook accepted and queued for processing",
      data: {
        pipelineId: result.pipeline.id,
        jobId: result.job.id,
        status: result.job.status,
        sourceKey: result.pipeline.source_key
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to enqueue webhook job",
      error: message
    });
  }
});
