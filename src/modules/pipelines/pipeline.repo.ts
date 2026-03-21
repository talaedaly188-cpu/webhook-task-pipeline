import { pool } from "../../db";

export type PipelineRow = {
  id: string;
  name: string;
  source_key: string;
  action_type: "add_metadata" | "pick_fields" | "rename_fields";
  action_config: Record<string, unknown>;
  is_active: boolean;
  webhook_secret: string | null;
  created_at: string;
  updated_at: string;
};

type CreatePipelineRowInput = {
  name: string;
  sourceKey: string;
  actionType: "add_metadata" | "pick_fields" | "rename_fields";
  actionConfig: Record<string, unknown>;
  isActive: boolean;
  webhookSecret?: string | null;
};

type UpdatePipelineRowInput = {
  name?: string;
  actionType?: "add_metadata" | "pick_fields" | "rename_fields";
  actionConfig?: Record<string, unknown>;
  isActive?: boolean;
};

export async function createPipelineRow(
  input: CreatePipelineRowInput
): Promise<PipelineRow> {
  const query = `
    INSERT INTO pipelines (
      name,
      source_key,
      action_type,
      action_config,
      is_active,
      webhook_secret
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    input.name,
    input.sourceKey,
    input.actionType,
    JSON.stringify(input.actionConfig),
    input.isActive,
    input.webhookSecret ?? null
  ];

  const result = await pool.query<PipelineRow>(query, values);
  return result.rows[0];
}

export async function getAllPipelineRows(): Promise<PipelineRow[]> {
  const query = `
    SELECT *
    FROM pipelines
    ORDER BY created_at DESC
  `;

  const result = await pool.query<PipelineRow>(query);
  return result.rows;
}

export async function getPipelineRowById(
  id: string
): Promise<PipelineRow | null> {
  const query = `
    SELECT *
    FROM pipelines
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query<PipelineRow>(query, [id]);
  return result.rows[0] ?? null;
}

export async function getPipelineRowBySourceKey(
  sourceKey: string
): Promise<PipelineRow | null> {
  const query = `
    SELECT *
    FROM pipelines
    WHERE source_key = $1
    LIMIT 1
  `;

  const result = await pool.query<PipelineRow>(query, [sourceKey]);
  return result.rows[0] ?? null;
}

export async function updatePipelineRowById(
  id: string,
  input: UpdatePipelineRowInput
): Promise<PipelineRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(input.name);
  }

  if (input.actionType !== undefined) {
    fields.push(`action_type = $${index++}`);
    values.push(input.actionType);
  }

  if (input.actionConfig !== undefined) {
    fields.push(`action_config = $${index++}`);
    values.push(JSON.stringify(input.actionConfig));
  }

  if (input.isActive !== undefined) {
    fields.push(`is_active = $${index++}`);
    values.push(input.isActive);
  }

  fields.push(`updated_at = NOW()`);

  if (fields.length === 1) {
    return getPipelineRowById(id);
  }

  values.push(id);

  const query = `
    UPDATE pipelines
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await pool.query<PipelineRow>(query, values);
  return result.rows[0] ?? null;
}

export async function deletePipelineRowById(id: string): Promise<boolean> {
  const query = `
    DELETE FROM pipelines
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return (result.rowCount ?? 0) > 0;
}
