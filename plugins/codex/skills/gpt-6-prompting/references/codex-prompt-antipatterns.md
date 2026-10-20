# Codex Prompt Anti-Patterns

Avoid these when prompting Codex or GPT-6.1 Sol or GPT-6 Astra.

Treat these as prompt-authoring examples. A user asking for thoughts authorizes discussion, not automatic review or implementation. Clarify the task in the forwarded prompt without expanding its scope.

## Vague task framing

Bad:

```text
Take a look at this and let me know what you think.
```

Better:

```xml
<task>
Review this change for material correctness and regression risks.
</task>
```

## Missing output contract

Bad:

```text
Investigate and report back.
```

Better:

```xml
<structured_output_contract>
Return:
1. root cause
2. evidence
3. smallest safe next step
</structured_output_contract>
```

## No follow-through default

Bad:

```text
Debug this failure.
```

Better:

```xml
<default_follow_through_policy>
Keep going until you have enough evidence to identify the root cause confidently.
</default_follow_through_policy>
```

## Asking for more reasoning instead of a better contract

Bad:

```text
Think harder and be very smart.
```

Better:

```xml
<verification_loop>
Before finalizing, verify that the answer matches the observed evidence and task requirements.
</verification_loop>
```

## Mixing unrelated jobs into one run

Bad:

```text
Review this diff, fix the bug you find, update the docs, and suggest a roadmap.
```

Better:
- Run review first.
- Run a separate fix prompt if needed.
- Use a third run for docs or roadmap work.

## Unsupported certainty

Bad:

```text
Tell me exactly why production failed.
```

Better:

```xml
<grounding_rules>
Ground every claim in the provided context or tool outputs.
If a point is an inference, label it clearly.
</grounding_rules>
```

## Reconfirming authorized work

A prompt that asks permission before every edit can stall an already authorized fix. State which actions are in scope, let Codex make routine reversible choices, and reserve questions for consequential gaps or actions beyond authorization. Prepare independent authorized work before requesting approval.

## Unbounded verification

A prompt that demands every possible test can keep a small task running after its acceptance criteria pass. Specify required checks and relevant behavior; repeat testing only after new changes, failures, or unresolved concerns.

## Conflicting skill instructions

Audit the prompt together with loaded skills. State that explicit user instructions take precedence over skill guidance, subject to higher-priority instructions and tool permissions. If a skill blocks progress, identify the exact file and instruction so the caller can resolve the conflict.
