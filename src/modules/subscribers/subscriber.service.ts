import type { CreateSubscriberInput } from "./subscriber.schemas";
import {
  createSubscriberRow,
  deleteSubscriberRowById,
  getSubscriberRowsByPipelineId
} from "./subscriber.repo";
import { getPipelineRowById } from "../pipelines/pipeline.repo";

export async function createSubscriber(
  pipelineId: string,
  input: CreateSubscriberInput
) {
  const pipeline = await getPipelineRowById(pipelineId);

  if (!pipeline) {
    return null;
  }

  return createSubscriberRow({
    pipelineId,
    targetUrl: input.targetUrl,
    secret: input.secret,
    isActive: input.isActive
  });
}

export async function getSubscribersByPipelineId(pipelineId: string) {
  const pipeline = await getPipelineRowById(pipelineId);

  if (!pipeline) {
    return null;
  }

  return getSubscriberRowsByPipelineId(pipelineId);
}

export async function deleteSubscriberById(id: string) {
  return deleteSubscriberRowById(id);
}
