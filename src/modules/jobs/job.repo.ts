import { pool } from "../../db";

export type JobRow = {
  id: string;
  pipeline_id: string;
  status: "queued" | "processing" | "completed" | "failed" | "partial_failed";
  input_payload: Record<string, unknown>;
  processed_payload: Record<string, unknown> | null;
  error_message: string | null;
  attempt_count: number;
  max_attempts: number;
  run_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
};

type CreateJobRowInput = {
  pipelineId: string;
  inputPayload: Record<string, unknown>;
  maxAttempts?: number;
};

export async function createJobRow(
  input: CreateJobRowInput
): Promise<JobRow> {
  const query = `
    INSERT INTO jobs (
      pipeline_id,
      status,
      input_payload,
      max_attempts
    )
    VALUES ($1, 'queued', $2, $3)
    RETURNING *
  `;

  const values = [
    input.pipelineId,
    JSON.stringify(input.inputPayload),
    input.maxAttempts ?? 3
  ];

  const result = await pool.query<JobRow>(query, values);
  return result.rows[0];
}

export async function getAllJobRows(): Promise<JobRow[]> {
  const query = `
    SELECT *
    FROM jobs
    ORDER BY created_at DESC
  `;

  const result = await pool.query<JobRow>(query);
  return result.rows;
}

export async function getJobRowById(id: string): Promise<JobRow | null> {
  const query = `
    SELECT *
    FROM jobs
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query<JobRow>(query, [id]);
  return result.rows[0] ?? null;
}
