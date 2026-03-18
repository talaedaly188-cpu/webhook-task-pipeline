import {
  createJobRow,
  getAllJobRows,
  getJobRowById
} from "./job.repo";
import { getPipelineRowBySourceKey } from "../pipelines/pipeline.repo";
import { getDeliveryAttemptRowsByJobId } from "../deliveries/delivery.repo";

export async function enqueueWebhookJob(
  sourceKey: string,
  payload: Record<string, unknown>
) {
  const pipeline = await getPipelineRowBySourceKey(sourceKey);

  if (!pipeline) {
    return {
      type: "not_found" as const
    };
  }

  if (!pipeline.is_active) {
    return {
      type: "inactive" as const
    };
  }

  const job = await createJobRow({
    pipelineId: pipeline.id,
    inputPayload: payload,
    maxAttempts: 3
  });

  return {
    type: "success" as const,
    pipeline,
    job
  };
}

export async function getJobs() {
  return getAllJobRows();
}

export async function getJobById(id: string) {
  return getJobRowById(id);
}

export async function getJobAttempts(jobId: string) {
  const job = await getJobRowById(jobId);

  if (!job) {
    return null;
  }

  const attempts = await getDeliveryAttemptRowsByJobId(jobId);

  return {
    job,
    attempts
  };
}
