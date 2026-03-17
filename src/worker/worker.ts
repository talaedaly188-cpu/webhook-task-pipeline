import { getPipelineRowById } from "../modules/pipelines/pipeline.repo";
import {
  claimNextQueuedJob,
  markJobCompleted,
  markJobFailed
} from "../modules/jobs/job.repo";
import { processPayload } from "../modules/processing/processor";

const POLL_INTERVAL_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }

  return {
    rawPayload: payload
  };
}

async function processOneJob(): Promise<boolean> {
  const job = await claimNextQueuedJob();

  if (!job) {
    return false;
  }

  try {
    const pipeline = await getPipelineRowById(job.pipeline_id);

    if (!pipeline) {
      await markJobFailed(job.id, "Pipeline not found");
      return true;
    }

    if (!pipeline.is_active) {
      await markJobFailed(job.id, "Pipeline is inactive");
      return true;
    }

    const processedPayload = processPayload({
      actionType: pipeline.action_type,
      actionConfig: pipeline.action_config ?? {},
      payload: normalizePayload(job.input_payload),
      pipelineId: pipeline.id
    });

    await markJobCompleted(job.id, processedPayload);

    console.log(`[worker] completed job ${job.id}`);
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown processing error";

    await markJobFailed(job.id, message);
    console.error(`[worker] failed job ${job.id}: ${message}`);
    return true;
  }
}

async function startWorker(): Promise<void> {
  console.log("[worker] started");

  while (true) {
    const didProcessJob = await processOneJob();

    if (!didProcessJob) {
      await sleep(POLL_INTERVAL_MS);
    }
  }
}

startWorker().catch((error) => {
  console.error("[worker] fatal error", error);
  process.exit(1);
});
