---
name: codex-in-workflow
description: Integrate Codex workers into a Claude workflow that needs completed task results, including structured responses and calls that outlast one Bash timeout.
---

# Codex in a workflow

A workflow that needs Codex's finished answer dispatches the `codex:codex-workflow` agent. The agent launches a background Codex job, waits on it in bounded intervals so no single Bash call outlives its timeout, and returns the completed answer or an explicit failure.

## Calling from a workflow

Dispatch agent type `codex:codex-workflow` at the workflow's normal worker step, and await its final response before anything downstream consumes it. Pass the task, the resolved Codex model and effort, the working directory, and whether Codex may edit files. Jobs run as ephemeral Codex threads unless you ask for a persistent one.

## Choosing the Codex model

The user may select Codex with `{{model}} / {{effort}}` notation, such as `sol / low` or `terra / high`. This notation selects the Codex run; it does not apply to the `Agent` call's own `model` parameter, which stays as the agent defines it. Translate it into a full model ID and effort for the handoff:

| Alias | Codex model ID |
| --- | --- |
| `sol` | `gpt-6.1-sol` |
| `astra` | `gpt-6-astra` |
| `terra` | `gpt-5.6-terra` |
| `luna` | `gpt-5.6-luna` |

Pass explicitly versioned model IDs through unchanged. Resolve model and effort independently: the user's choice wins, then the workflow's own configuration, then `sol / medium`. Accepted efforts are `none`, `minimal`, `low`, `medium`, `high`, and `xhigh`, but `gpt-6.1-sol` and `gpt-6-astra` don't support `none` or `minimal`; if the user pairs them, ask for a supported effort before dispatch rather than changing it silently.

## Structured output

For structured output, include the JSON schema the task should return. Add an optional string field `forwardError` to the agent's response schema, with a branch that accepts an object containing only that field, so a failure never has to invent task fields. Check `forwardError` before reading task data and route it through the workflow's existing failure handling. Because failures always arrive this way, an empty result means Codex really returned an empty result.

Codex's answer is not schema-constrained: the companion's `--json` flag formats the runtime's own output, not Codex's reply. The agent asks Codex for JSON and checks its shape; if the workflow needs a hard guarantee, validate the response with the workflow's schema validator.

## What comes back

- Success: Codex's answer, as text unchanged or as the parsed JSON object.
- Failure: `{"forwardError":"<stage, diagnostic, job ID and status if known>"}` for structured calls, or `Codex workflow failed: <same details>` for text calls.

A failure that names a job still `queued` or `running` means the wait was interrupted, not that the job died. Relaunching would duplicate its work; dispatch the agent again with that job ID to resume waiting, or ask it to cancel the job.
