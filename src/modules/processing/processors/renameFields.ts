type RenameFieldsConfig = {
  mapping?: Record<string, string>;
};

export function renameFieldsProcessor(
  payload: Record<string, unknown>,
  config: Record<string, unknown>
): Record<string, unknown> {
  const typedConfig = config as RenameFieldsConfig;
  const mapping = typedConfig.mapping ?? {};

  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    const renamedKey = typeof mapping[key] === "string" ? mapping[key] : key;
    output[renamedKey] = value;
  }

  return output;
}
