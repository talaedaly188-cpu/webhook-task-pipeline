import { pool } from "../../db";

export type DeliveryAttemptRow = {
  id: string;
  job_id: string;
  subscriber_id: string;
  attempt_number: number;
  status: "success" | "failed";
  response_status_code: number | null;
  response_body: string | null;
  error_message: string | null;
  attempted_at: string;
};

type CreateDeliveryAttemptInput = {
  jobId: string;
  subscriberId: string;
  attemptNumber: number;
  status: "success" | "failed";
  responseStatusCode?: number | null;
  responseBody?: string | null;
  errorMessage?: string | null;
};

export async function createDeliveryAttemptRow(
  input: CreateDeliveryAttemptInput
): Promise<DeliveryAttemptRow> {
  const query = `
    INSERT INTO delivery_attempts (
      job_id,
      subscriber_id,
      attempt_number,
      status,
      response_status_code,
      response_body,
      error_message
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    input.jobId,
    input.subscriberId,
    input.attemptNumber,
    input.status,
    input.responseStatusCode ?? null,
    input.responseBody ?? null,
    input.errorMessage ?? null
  ];

  const result = await pool.query<DeliveryAttemptRow>(query, values);
  return result.rows[0];
}

export async function getDeliveryAttemptRowsByJobId(
  jobId: string
): Promise<DeliveryAttemptRow[]> {
  const query = `
    SELECT *
    FROM delivery_attempts
    WHERE job_id = $1
    ORDER BY attempted_at ASC, attempt_number ASC
  `;

  const result = await pool.query<DeliveryAttemptRow>(query, [jobId]);
  return result.rows;
}
