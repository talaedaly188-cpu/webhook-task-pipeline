import { randomBytes } from "node:crypto";
import type {
  CreatePipelineInput,
  UpdatePipelineInput
} from "./pipeline.schemas";
import {
  createPipelineRow,
  deletePipelineRowById,
  getAllPipelineRows,
  getPipelineRowById,
  updatePipelineRowById
} from "./pipeline.repo";

function generateSourceKey(): string {
  return `pipe_${randomBytes(8).toString("hex")}`;
}

export async function createPipeline(input: CreatePipelineInput) {
  return createPipelineRow({
    name: input.name,
    sourceKey: generateSourceKey(),
    actionType: input.actionType,
    actionConfig: input.actionConfig,
    isActive: input.isActive
  });
}

export async function getPipelines() {
  return getAllPipelineRows();
}

export async function getPipelineById(id: string) {
  return getPipelineRowById(id);
}

export async function updatePipelineById(
  id: string,
  input: UpdatePipelineInput
) {
  return updatePipelineRowById(id, {
    name: input.name,
    actionType: input.actionType,
    actionConfig: input.actionConfig,
    isActive: input.isActive
  });
}

export async function deletePipelineById(id: string) {
  return deletePipelineRowById(id);
}
