import { Router } from "express";
import { ZodError } from "zod";
import { createSubscriberSchema } from "./subscriber.schemas";
import {
  createSubscriber,
  deleteSubscriberById,
  getSubscribersByPipelineId
} from "./subscriber.service";

export const subscriberRouter = Router();

subscriberRouter.post("/pipelines/:pipelineId/subscribers", async (req, res) => {
  try {
    const input = createSubscriberSchema.parse(req.body);
    const subscriber = await createSubscriber(req.params.pipelineId, input);

    if (!subscriber) {
      return res.status(404).json({
        message: "Pipeline not found"
      });
    }

    return res.status(201).json({
      message: "Subscriber created successfully",
      data: subscriber
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: error.flatten()
      });
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to create subscriber",
      error: message
    });
  }
});

subscriberRouter.get("/pipelines/:pipelineId/subscribers", async (req, res) => {
  try {
    const subscribers = await getSubscribersByPipelineId(req.params.pipelineId);

    if (!subscribers) {
      return res.status(404).json({
        message: "Pipeline not found"
      });
    }

    return res.status(200).json({
      data: subscribers
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to fetch subscribers",
      error: message
    });
  }
});

subscriberRouter.delete("/subscribers/:id", async (req, res) => {
  try {
    const deleted = await deleteSubscriberById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Subscriber not found"
      });
    }

    return res.status(200).json({
      message: "Subscriber deleted successfully"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to delete subscriber",
      error: message
    });
  }
});
