import { Router } from "express";
import { getJobById, getJobs } from "./job.service";

export const jobRouter = Router();

jobRouter.get("/", async (_req, res) => {
  try {
    const jobs = await getJobs();

    return res.status(200).json({
      data: jobs
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to fetch jobs",
      error: message
    });
  }
});

jobRouter.get("/:id", async (req, res) => {
  try {
    const job = await getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    return res.status(200).json({
      data: job
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to fetch job",
      error: message
    });
  }
});
