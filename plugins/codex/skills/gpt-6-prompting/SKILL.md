---
name: gpt-6-prompting
description: Internal guidance for composing Codex prompts for GPT-6.1 Sol and GPT-6 Astra coding, review, diagnosis, and research tasks
user-invocable: false
---

# GPT-6 Prompting

Use this skill when `codex:codex-rescue` needs to shape a request for Codex. Draft only from the supplied context; the forwarding agent does not inspect the repository or solve the task.

This guidance applies to `gpt-6.1-sol` and `gpt-6-astra`. It follows [OpenAI's GPT-6 prompting guidance](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices), checked on 2026-10-19. That guidance describes behavior observed with Astra and recommends evaluating it on the chosen model and workload; it does not establish identical behavior on Sol.

## Compose the request

1. State the task, supplied context, authorized actions, and completion criteria in `<task>`. Preserve discussion, diagnosis, and review as such unless the user also requests implementation.
2. Choose the smallest output contract that makes the result usable. Lead with the outcome, evidence, and material limitations in plain language; retain exact JSON or verdict formats where required.
3. Set follow-through within the authorized scope. For implementation, carry the work through the fix and appropriate verification. Resolve routine reversible choices without repeated permission; ask only for missing information that materially changes the outcome or for an action outside authorization. Continue independent authorized work while blocked.
4. Add only the grounding, verification, and scope blocks the task needs. Run required and relevant checks, then finish unless a failure, new edit, or unresolved concern justifies more testing.
5. Check for conflicting instructions and remove repetition. Explicit user instructions take precedence over skill guidance, subject to higher-priority instructions and tool permissions. If a skill blocks completion, identify its exact file and instruction and explain the concrete blocker.

Use XML blocks as this plugin's prompt convention, not as a model requirement. Prefer a clear task and acceptance criteria over adding more instructions or increasing reasoning effort.

## Model and effort controls

- Leave model and effort unset unless the user chooses them; preserve the configured Codex defaults.
- Pass explicit `gpt-6.1-sol` and `gpt-6-astra` model IDs through unchanged. Preserve other explicitly requested models as well.
- Both target models require reasoning: `none` and `minimal` are not supported. If the user explicitly combines either target with an unsupported effort, the calling command should resolve that choice before dispatching the forwarding agent; preserve the requested values rather than silently substituting one.
- The plugin currently accepts `low`, `medium`, `high`, and `xhigh` for these models. API support for additional effort levels does not imply this runtime accepts them. Keep runtime flags outside the prompt text.

## Choose the workflow

- Use built-in `review` or `adversarial-review` commands when the job is reviewing local git changes. Those prompts already carry the review contract; the rescue forwarder itself only calls `task`.
- Use `task` when the task is diagnosis, planning, research, or implementation and you need to control the prompt directly.
- Use `task --resume-last` for a continuation on the same Codex thread. Send the changed requirement or next step while preserving the original scope and completed work; a side question does not cancel an active task.
- Keep the rescue wrapper to one runtime call. When the delegated Codex task permits subagents and tools are available, use them for independent work only when useful. Give each agent bounded scope, evidence, ownership, and a completion criterion; reconcile results before finishing.

Read [prompt blocks](references/prompt-blocks.md) when assembling a custom contract, [recipes](references/codex-prompt-recipes.md) for a task template, or [anti-patterns](references/codex-prompt-antipatterns.md) when diagnosing an underperforming prompt. Load only the reference needed.
