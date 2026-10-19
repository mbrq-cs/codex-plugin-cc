import test from "node:test";
import assert from "node:assert/strict";

import { enrichJob } from "../plugins/codex/scripts/lib/job-control.mjs";

import { renderReviewResult, renderStoredJobResult } from "../plugins/codex/scripts/lib/render.mjs";

test("renderReviewResult degrades gracefully when JSON is missing required review fields", () => {
  const output = renderReviewResult(
    {
      parsed: {
        verdict: "approve",
        summary: "Looks fine."
      },
      rawOutput: JSON.stringify({
        verdict: "approve",
        summary: "Looks fine."
      }),
      parseError: null
    },
    {
      reviewLabel: "Adversarial Review",
      targetLabel: "working tree diff"
    }
  );

  assert.match(output, /Codex returned JSON with an unexpected review shape\./);
  assert.match(output, /Missing array `findings`\./);
  assert.match(output, /Raw final message:/);
});

test("renderStoredJobResult prefers rendered output for structured review jobs", () => {
  const output = renderStoredJobResult(
    {
      id: "review-123",
      status: "completed",
      title: "Codex Adversarial Review",
      jobClass: "review",
      threadId: "thr_123"
    },
    {
      threadId: "thr_123",
      rendered: "# Codex Adversarial Review\n\nTarget: working tree diff\nVerdict: needs-attention\n",
      result: {
        result: {
          verdict: "needs-attention",
          summary: "One issue.",
          findings: [],
          next_steps: []
        },
        rawOutput:
          '{"verdict":"needs-attention","summary":"One issue.","findings":[],"next_steps":[]}'
      }
    }
  );

  assert.match(output, /^# Codex Adversarial Review/);
  assert.doesNotMatch(output, /^\{/);
  assert.match(output, /Codex session ID: thr_123/);
  assert.match(output, /Resume in Codex: codex resume thr_123/);
});

test("task display uses delegate labels without rewriting legacy job records", () => {
  const legacyJob = Object.freeze({ kind: "task", jobClass: "task", kindLabel: "rescue", status: "completed", threadId: "thr_existing" });
  const enriched = enrichJob(legacyJob);
  assert.equal(enriched.kindLabel, "delegate");
  assert.equal(enriched.threadId, "thr_existing");
  assert.equal(legacyJob.kindLabel, "rescue");
  assert.equal(enrichJob({ kind: "task", status: "completed" }).kindLabel, "delegate");
  assert.equal(enrichJob({ jobClass: "task", status: "completed" }).kindLabel, "delegate");
  assert.equal(enrichJob({ kindLabel: "adversarial-review", status: "completed" }).kindLabel, "adversarial-review");
});
