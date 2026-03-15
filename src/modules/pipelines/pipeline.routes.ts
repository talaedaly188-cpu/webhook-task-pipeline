import { Router } from "express";
import { ZodError } from "zod";
import {
  createPipelineSchema,
  updatePipelineSchema
} from "./pipeline.schemas";
import {
  createPipeline,
  deletePipelineById,
  getPipelineById,
  getPipelines,
  updatePipelineById
} from "./pipeline.service";

export const pipelineRouter = Router();

pipelineRouter.post("/", async (req, res) => {
  try {
    const input = createPipelineSchema.parse(req.body);
    const pipeline = await createPipeline(input);

    res.status(201).json({
      message: "Pipeline created successfully",
      data: pipeline
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
      message: "Failed to create pipeline",
      error: message
    });
  }
});

pipelineRouter.get("/", async (_req, res) => {
  try {
    const pipelines = await getPipelines();

    res.status(200).json({
      data: pipelines
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    res.status(500).json({
      message: "Failed to fetch pipelines",
      error: message
    });
  }
});

pipelineRouter.get("/:id", async (req, res) => {
  try {
    const pipeline = await getPipelineById(req.params.id);

    if (!pipeline) {
      return res.status(404).json({
        message: "Pipeline not found"
      });
    }

    return res.status(200).json({
      data: pipeline
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to fetch pipeline",
      error: message
    });
  }
});

pipelineRouter.patch("/:id", async (req, res) => {
  try {
    const input = updatePipelineSchema.parse(req.body);
    const pipeline = await updatePipelineById(req.params.id, input);

    if (!pipeline) {
      return res.status(404).json({
        message: "Pipeline not found"
      });
    }

    return res.status(200).json({
      message: "Pipeline updated successfully",
      data: pipeline
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
      message: "Failed to update pipeline",
      error: message
    });
  }
});

pipelineRouter.delete("/:id", async (req, res) => {
  try {
    const deleted = await deletePipelineById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Pipeline not found"
      });
    }

    return res.status(200).json({
      message: "Pipeline deleted successfully"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to delete pipeline",
      error: message
    });
  }
});
