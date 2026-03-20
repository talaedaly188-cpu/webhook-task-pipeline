# Webhook Task Pipeline

A production-ready webhook processing system built with Node.js, TypeScript, PostgreSQL, and Docker.

---

## Overview

This system allows external services to send webhooks, process them through configurable pipelines, and deliver the processed data to multiple subscribers with retry logic and full tracking.

---

## Features

* Webhook ingestion system
* Configurable pipelines (transformations)
* Background worker processing
* Subscriber delivery system
* Retry logic (0s, 2s, 5s)
* Delivery attempt tracking
* Job status tracking (completed / failed / partial_failed)
* REST API
* Fully Dockerized (API + Worker + DB)

---

## Architecture

```
Webhook → API → Database → Worker → Processing → Delivery → Subscribers
```

---

## Workflow

1. A webhook is received via API
2. A job is created and stored in DB
3. Worker picks the job
4. Payload is processed
5. Delivered to subscribers
6. Retries happen on failure
7. Final job status is determined

---

## Tech Stack

* Node.js
* TypeScript
* Express
* PostgreSQL
* Docker & Docker Compose

---

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd webhook-task-pipeline
```

### 2. Run with Docker

```bash
docker compose up --build
```

### 3. Check health

```bash
curl http://localhost:3000/health
```

---

## API Endpoints

### Pipelines

* GET /pipelines
* POST /pipelines

### Subscribers

* POST /pipelines/:id/subscribers

### Webhooks

* POST /webhooks/:sourceKey

### Jobs

* GET /jobs
* GET /jobs/:id
* GET /jobs/:id/attempts

---

## Retry Logic

* Max attempts: 3
* Delays: 0s, 2s, 5s
* Retries on:

  * Network errors
  * 5xx responses

---

## Job Status

* completed → all deliveries succeeded
* partial_failed → some failed
* failed → all failed

---

## Docker Services

* API (port 3000)
* Worker
* PostgreSQL

---

## Author

Built by Tala
