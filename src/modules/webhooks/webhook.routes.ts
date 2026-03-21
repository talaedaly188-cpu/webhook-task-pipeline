import { Router } from "express";
import { enqueueWebhookJob } from "../jobs/job.service";
import { verifySignature } from "../../utils/signature";
import { getPipelineRowBySourceKey } from "../pipelines/pipeline.repo";

export const webhookRouter = Router();

webhookRouter.post("/:sourceKey", async (req, res) => {
  try {
    const pipeline = await getPipelineRowBySourceKey(req.params.sourceKey);

    if (!pipeline) {
      return res.status(404).json({
        message: "Pipeline not found for this source key"
      });
    }

    if (!pipeline.is_active) {
      return res.status(400).json({
        message: "Pipeline is inactive"
      });
    }

    const signature = req.header("x-signature");

    if (pipeline.webhook_secret) {
      if (!signature) {
        return res.status(401).json({
          message: "Missing signature"
        });
      }

      const isValid = verifySignature(
        pipeline.webhook_secret,
        (req as any).rawBody,
        signature
      );

      if (!isValid) {
        return res.status(401).json({
          message: "Invalid signature"
        });
      }
    }

    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : { rawBody: req.body };

    const result = await enqueueWebhookJob(req.params.sourceKey, body);

    if (!result.pipeline || !result.job) {
      return res.status(500).json({
        message: "Failed to enqueue job properly"
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
