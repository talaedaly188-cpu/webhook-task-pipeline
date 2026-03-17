type PickFieldsConfig = {
  fields?: string[];
};

export function pickFieldsProcessor(
  payload: Record<string, unknown>,
  config: Record<string, unknown>
): Record<string, unknown> {
  const typedConfig = config as PickFieldsConfig;
  const fields = Array.isArray(typedConfig.fields) ? typedConfig.fields : [];

  const output: Record<string, unknown> = {};

  for (const field of fields) {
    if (field in payload) {
      output[field] = payload[field];
    }
  }

  return output;
}
