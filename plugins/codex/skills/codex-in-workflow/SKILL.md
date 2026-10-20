---
name: codex-in-workflow
description: Integrate Codex workers into a Claude workflow that needs completed task results, including structured responses and calls that outlast one Bash timeout.
---

# Codex in a workflow

Use `codex:codex-workflow` as the forwarding agent when a workflow needs a completed Codex result. The ordinary `codex:codex-delegate` agent is a single-call, verbatim forwarder; its command's `--background` controls Claude's agent execution and does not join a Codex job.

## Calling from a workflow

Select agent type `codex:codex-workflow` at the workflow's existing worker dispatch point. Supply the task, resolved Codex model and effort, working directory, and permitted read/write mode. The workflow must await this agent's final response before advancing its dependency barrier. The outer workflow may itself run in the background.

For structured output, give the forwarder the expected JSON schema and reserve an optional string field named `forwardError` in the workflow agent's response schema. Allow an error-only object through that schema (for example, a separate error branch), so failure does not require fabricated task fields. At the dispatch boundary, check `forwardError` before consuming task data and route it through the workflow's existing failure handling. An empty list is a successful task result only when Codex actually returned it after a completed run.

The current `task --json` option serializes the runtime envelope; it does not enforce a schema on Codex's answer. The forwarder asks Codex for JSON and checks the returned shape. Use the workflow's schema validator when available; do not claim runtime schema enforcement.

## Forwarding procedure

These steps are for the `codex:codex-workflow` worker itself. Execute the companion directly; do not dispatch another forwarding agent.

1. Write the task text to a uniquely named absolute temporary file using `Write`. Include the requested response schema and ask for a single JSON object when structured output is required. Keep task prose out of shell command text, including heredocs. If writing the file is unavailable or denied, return an explicit failure.
2. Launch one companion job with the prompt file and `--background --json`. Record the returned `jobId`. Unlike `/codex:delegate --background`, this is the companion runtime's background mode. Use the supplied full model ID and effort; preserve the requested task scope and permissions. Add `--write` only for authorized edits. Independent workflow calls start fresh; add `--ephemeral` only when requested.
3. Await that exact job with `status <jobId> --wait --timeout-ms 50000 --json`, using a Bash timeout longer than the requested wait. Repeat while `job.status` is `queued` or `running`. `waitTimedOut: true` means this wait interval expired, not that the task finished or failed. Keep the same job ID and working directory across calls.
4. Once terminal, fetch `result <jobId> --json`. Accept a task answer only when `job.status` is `completed`, and read it from `storedJob.result.rawOutput`. For structured output, parse and check the requested shape before returning that object. For text output, return the raw answer unchanged.

Example command shapes (substitute the actual paths, resolved selection, and returned job ID):

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" task --cwd "/absolute/worktree" --model gpt-6.1-sol --effort medium --prompt-file "/absolute/temp/task-unique.txt" --background --json
node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" status "<jobId>" --cwd "/absolute/worktree" --wait --timeout-ms 50000 --json
node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" result "<jobId>" --cwd "/absolute/worktree" --json
```

The Bash calls carry only controls and paths. Follow the host's normal permission handling; a denied call is a forwarding failure, not a reason to rewrite the prompt or bypass a hook.

## Failure and interruption

Return `{"forwardError":"<stage, diagnostic, and job ID if known>"}` for structured calls, or `Codex workflow failed: <same details>` for text calls, when launch, status retrieval, result retrieval, or output parsing fails, or the job is failed/cancelled. Include a known job's status so the caller can distinguish a running job from a terminal failure. Never substitute empty task data.

If a wait call is interrupted or denied after launch, surface the job ID and whether it may still be running. Resume waiting on that job when authorized; launching a replacement could duplicate work. Honor the caller's deadline or cancellation instruction using `cancel <jobId> --cwd <same-directory> --json` when cancellation is requested, and report its outcome. Do not retry launches or malformed task answers automatically.

This worker only transports the task and its result. It does not inspect source, solve the task, or repair Codex's answer.
