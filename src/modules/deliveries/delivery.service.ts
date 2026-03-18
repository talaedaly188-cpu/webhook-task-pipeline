import { createDeliveryAttemptRow } from "./delivery.repo";
import { getActiveSubscriberRowsByPipelineId } from "../subscribers/subscriber.repo";

const MAX_DELIVERY_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [0, 2000, 5000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeReadResponseText(response: Response): Promise<string | null> {
  try {
    return await response.text();
  } catch {
    return null;
  }
}

function shouldRetry(statusCode: number | null, networkError: boolean): boolean {
  if (networkError) {
    return true;
  }

  if (statusCode === null) {
    return true;
  }

  if (statusCode >= 500) {
    return true;
  }

  return false;
}

type DeliverToSubscribersInput = {
  pipelineId: string;
  jobId: string;
  processedPayload: Record<string, unknown>;
};

type DeliverToSubscribersResult = {
  totalSubscribers: number;
  successCount: number;
  failedCount: number;
};

export async function deliverToSubscribers({
  pipelineId,
  jobId,
  processedPayload
}: DeliverToSubscribersInput): Promise<DeliverToSubscribersResult> {
  const subscribers = await getActiveSubscriberRowsByPipelineId(pipelineId);

  if (subscribers.length === 0) {
    return {
      totalSubscribers: 0,
      successCount: 0,
      failedCount: 0
    };
  }

  let successCount = 0;
  let failedCount = 0;

  for (const subscriber of subscribers) {
    let delivered = false;

    for (let attempt = 1; attempt <= MAX_DELIVERY_ATTEMPTS; attempt++) {
      const delay = RETRY_DELAYS_MS[attempt - 1] ?? 0;

      if (delay > 0) {
        await sleep(delay);
      }

      try {
        const response = await fetch(subscriber.target_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(subscriber.secret
              ? { "X-Subscriber-Secret": subscriber.secret }
              : {})
          },
          body: JSON.stringify({
            jobId,
            pipelineId,
            subscriberId: subscriber.id,
            deliveredAt: new Date().toISOString(),
            payload: processedPayload
          })
        });

        const responseBody = await safeReadResponseText(response);

        if (response.ok) {
          await createDeliveryAttemptRow({
            jobId,
            subscriberId: subscriber.id,
            attemptNumber: attempt,
            status: "success",
            responseStatusCode: response.status,
            responseBody
          });

          successCount += 1;
          delivered = true;
          break;
        }

        await createDeliveryAttemptRow({
          jobId,
          subscriberId: subscriber.id,
          attemptNumber: attempt,
          status: "failed",
          responseStatusCode: response.status,
          responseBody,
          errorMessage: `Subscriber responded with status ${response.status}`
        });

        const retry = shouldRetry(response.status, false);

        if (!retry || attempt === MAX_DELIVERY_ATTEMPTS) {
          failedCount += 1;
          break;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown network error";

        await createDeliveryAttemptRow({
          jobId,
          subscriberId: subscriber.id,
          attemptNumber: attempt,
          status: "failed",
          errorMessage: message
        });

        const retry = shouldRetry(null, true);

        if (!retry || attempt === MAX_DELIVERY_ATTEMPTS) {
          failedCount += 1;
          break;
        }
      }
    }

    if (!delivered) {
      console.error(
        `[delivery] failed to deliver job ${jobId} to subscriber ${subscriber.id}`
      );
    }
  }

  return {
    totalSubscribers: subscribers.length,
    successCount,
    failedCount
  };
}
