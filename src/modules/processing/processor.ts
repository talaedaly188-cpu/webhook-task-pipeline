import { addMetadataProcessor } from "./processors/addMetadata";
import { pickFieldsProcessor } from "./processors/pickFields";
import { renameFieldsProcessor } from "./processors/renameFields";

type ActionType = "add_metadata" | "pick_fields" | "rename_fields";

type ProcessPayloadInput = {
  actionType: ActionType;
  actionConfig: Record<string, unknown>;
  payload: Record<string, unknown>;
  pipelineId: string;
};

export function processPayload({
  actionType,
  actionConfig,
  payload,
  pipelineId
}: ProcessPayloadInput): Record<string, unknown> {
  switch (actionType) {
    case "add_metadata":
      return addMetadataProcessor(payload, actionConfig, pipelineId);

    case "pick_fields":
      return pickFieldsProcessor(payload, actionConfig);

    case "rename_fields":
      return renameFieldsProcessor(payload, actionConfig);

    default:
      throw new Error(`Unsupported action type: ${actionType satisfies never}`);
  }
}
