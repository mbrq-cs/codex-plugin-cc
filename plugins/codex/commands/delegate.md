---
description: Delegate implementation, investigation, planning, research, or follow-up work to Codex
argument-hint: "[--background|--wait] [--resume|--fresh] [--ephemeral|--oneshot] [model / effort] [--model <model>] [--effort <none|minimal|low|medium|high|xhigh>] [task Codex should complete or continue]"
allowed-tools: Bash(node:*), AskUserQuestion, Agent
---

Invoke the `codex:codex-delegate` subagent via the `Agent` tool (`subagent_type: "codex:codex-delegate"`), forwarding the task with the Codex model and effort resolved below.
`codex:codex-delegate` is a subagent, not a skill — do not call `Skill(codex:codex-delegate)` (no such skill) or `Skill(codex:delegate)` (that re-enters this command and hangs the session). The command runs inline so the `Agent` tool stays in scope; forked general-purpose subagents do not expose it.
The final user-visible response must be Codex's output verbatim.

Raw user request:
$ARGUMENTS

Codex model notation:

Interpret `{{model}} / {{effort}}` (for example, `sol / medium`) as the model and reasoning effort for the delegated Codex run. These are Codex-specific aliases, independent of Claude's global mappings:

| Alias | Codex model ID |
| --- | --- |
| `sol` | `gpt-6.1-sol` |
| `astra` | `gpt-6-astra` |
| `terra` | `gpt-5.6-terra` |
| `luna` | `gpt-5.6-luna` |

- Expand these aliases in selection notation and `--model`; preserve explicitly versioned model IDs unchanged. Interpret notation only when it requests model selection, not inside quoted task content, paths, or examples to analyze.
- Resolve model and effort independently: user-specified parameters take precedence, followed by the applicable skill, workflow, or agent definition. Use `sol / medium` only for values none of those prescribes. If explicit flags and notation conflict, ask which selection to use rather than silently choosing.
- Convert the resolved selection to `--model <full-model-id> --effort <effort>` in the forwarded request, removing selection notation from task text. Include applicable configuration from the calling workflow in the handoff so the forwarding agent does not need to infer it.
- These controls select Codex through the companion runtime. Keep the Claude forwarding agent's own model as defined in its frontmatter; do not apply Codex aliases to Claude's `Agent` model parameter.
- Example: `/codex:delegate astra / high investigate the regression` forwards `--model gpt-6-astra --effort high` with task text `investigate the regression`.

Execution mode:

- `--oneshot` is an exact alias for `--ephemeral`. Normalize it to `--ephemeral` before applying the execution and resume rules below; remove it from task text.

- If the request includes `--background`, run the `codex:codex-delegate` subagent in the background.
- If the request includes `--wait`, run the `codex:codex-delegate` subagent in the foreground.
- If neither flag is present, default to foreground.
- `--background` and `--wait` are execution flags for Claude Code. Do not forward them to `task`, and do not treat them as part of the natural-language task text.
- `--model` and `--effort` are runtime-selection flags. Preserve them for the forwarded `task` call, but do not treat them as part of the natural-language task text.
- Before dispatch, if the user explicitly pairs `gpt-6.1-sol` or `gpt-6-astra` with `none` or `minimal`, explain that the model does not support that effort and ask for one of `low`, `medium`, `high`, or `xhigh`. These are the efforts supported by both the target models and this plugin. Validate the resolved selection, including aliases and inherited values, before dispatch. If an effort is outside the plugin's accepted values, explain the limitation and ask for a supported value; do not silently downgrade it.
- If the request includes `--ephemeral`, forward it to `task` as a runtime flag, remove it from task text, and start a fresh non-persistent Codex thread. Skip the resume-candidate lookup and question. Reject combining it with `--resume` or `--resume-last`; `--fresh` is compatible. Plugin job results and logs remain available, but the Codex conversation cannot be resumed later.
- If the request includes `--resume`, do not ask whether to continue. The user already chose.
- If the request includes `--fresh`, do not ask whether to continue. The user already chose.
- Otherwise (without `--ephemeral`, `--resume`, or `--fresh`), before starting Codex, check for a resumable delegated thread from this Claude session by running:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" task-resume-candidate --json
```

- If that helper reports `available: true`, use `AskUserQuestion` exactly once to ask whether to continue the current Codex thread or start a new one.
- The two choices must be:
  - `Continue current Codex thread`
  - `Start a new Codex thread`
- If the user is clearly giving a follow-up instruction such as "continue", "keep going", "resume", "apply the top fix", or "dig deeper", put `Continue current Codex thread (Recommended)` first.
- Otherwise put `Start a new Codex thread (Recommended)` first.
- If the user chooses continue, add `--resume` before routing to the subagent.
- If the user chooses a new thread, add `--fresh` before routing to the subagent.
- If the helper reports `available: false`, do not ask. Route normally.

Operating rules:

- The subagent is a thin forwarder only. It should use one `Bash` call to invoke `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" task ...` and return that command's stdout as-is.
- Return the Codex companion stdout verbatim to the user.
- Do not paraphrase, summarize, rewrite, or add commentary before or after it.
- Do not ask the subagent to inspect files, monitor progress, poll `/codex:status`, fetch `/codex:result`, call `/codex:cancel`, summarize output, or do follow-up work of its own.
- Forward the resolved Codex model and effort from the notation rules above as runtime flags.
- Leave `--resume` and `--fresh` in the forwarded request. The subagent handles that routing when it builds the `task` command.
- If the helper reports that Codex is missing or unauthenticated, stop and tell the user to run `/codex:setup`.
- If the user did not supply a request, ask what task Codex should complete.
