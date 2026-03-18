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

export async function claimNextQueuedJob(): Promise<JobRow | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const query = `
      WITH next_job AS (
        SELECT id
        FROM jobs
        WHERE status = 'queued'
          AND run_at <= NOW()
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE jobs
      SET
        status = 'processing',
        attempt_count = attempt_count + 1,
        updated_at = NOW()
      WHERE id IN (SELECT id FROM next_job)
      RETURNING *
    `;

    const result = await client.query<JobRow>(query);

    await client.query("COMMIT");

    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function saveProcessedPayload(
  jobId: string,
  processedPayload: Record<string, unknown>
): Promise<JobRow | null> {
  const query = `
    UPDATE jobs
    SET
      processed_payload = $2,
      processed_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query<JobRow>(query, [
    jobId,
    JSON.stringify(processedPayload)
  ]);

  return result.rows[0] ?? null;
}

export async function markJobFinalStatus(
  jobId: string,
  status: "completed" | "failed" | "partial_failed",
  errorMessage: string | null = null
): Promise<JobRow | null> {
  const query = `
    UPDATE jobs
    SET
      status = $2,
      error_message = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query<JobRow>(query, [jobId, status, errorMessage]);
  return result.rows[0] ?? null;
}

export async function markJobFailed(
  jobId: string,
  errorMessage: string
): Promise<JobRow | null> {
  return markJobFinalStatus(jobId, "failed", errorMessage);
}
