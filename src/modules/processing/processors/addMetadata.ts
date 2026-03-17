type AddMetadataConfig = {
  addProcessedAt?: boolean;
  addPipelineId?: boolean;
  staticFields?: Record<string, unknown>;
};

export function addMetadataProcessor(
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
  pipelineId: string
): Record<string, unknown> {
  const typedConfig = config as AddMetadataConfig;

  return {
    ...payload,
    ...(typedConfig.staticFields ?? {}),
    ...(typedConfig.addPipelineId !== false ? { pipelineId } : {}),
    ...(typedConfig.addProcessedAt !== false
      ? { processedAt: new Date().toISOString() }
      : {})
  };
}
