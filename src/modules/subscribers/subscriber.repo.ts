import { pool } from "../../db";

export type SubscriberRow = {
  id: string;
  pipeline_id: string;
  target_url: string;
  secret: string | null;
  is_active: boolean;
  created_at: string;
};

type CreateSubscriberRowInput = {
  pipelineId: string;
  targetUrl: string;
  secret?: string;
  isActive: boolean;
};

export async function createSubscriberRow(
  input: CreateSubscriberRowInput
): Promise<SubscriberRow> {
  const query = `
    INSERT INTO subscribers (
      pipeline_id,
      target_url,
      secret,
      is_active
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    input.pipelineId,
    input.targetUrl,
    input.secret ?? null,
    input.isActive
  ];

  const result = await pool.query<SubscriberRow>(query, values);
  return result.rows[0];
}

export async function getSubscriberRowsByPipelineId(
  pipelineId: string
): Promise<SubscriberRow[]> {
  const query = `
    SELECT *
    FROM subscribers
    WHERE pipeline_id = $1
    ORDER BY created_at DESC
  `;

  const result = await pool.query<SubscriberRow>(query, [pipelineId]);
  return result.rows;
}

export async function deleteSubscriberRowById(id: string): Promise<boolean> {
  const query = `
    DELETE FROM subscribers
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return (result.rowCount ?? 0) > 0;
}
