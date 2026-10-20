# Prompt Blocks

Use these blocks selectively when composing Codex or GPT-6.1 Sol or GPT-6 Astra prompts.
Wrap each block in the XML tag shown in its heading.

## Core Wrapper

### `task`

Use in nearly every prompt.

```xml
<task>
Describe the concrete job, the relevant repository or failure context, and the expected end state.
</task>
```

## Output and Format

### `structured_output_contract`

Use when the response shape matters.

```xml
<structured_output_contract>
Return exactly the requested output shape and nothing else.
Keep the answer compact.
Put the highest-value findings or decisions first.
</structured_output_contract>
```

### `compact_output_contract`

Use when you want concise prose instead of a schema.

```xml
<compact_output_contract>
Lead with the outcome and why it matters, using concise, plain paragraphs.
Use lists for parallel items or steps; include evidence and material limitations without a tool-by-tool recap.
</compact_output_contract>
```

## Follow-through and Completion

### `default_follow_through_policy`

Use when Codex should act without asking routine questions.

```xml
<default_follow_through_policy>
Carry the authorized task through completion, making routine reversible choices within scope.
Ask only when missing information materially changes the outcome or an action exceeds authorization. Continue independent authorized work while blocked.
Prepare the concrete result before requesting any necessary approval. Preserve authorization already given.
</default_follow_through_policy>
```

### `completeness_contract`

Use for debugging, implementation, or any multi-step task that should not stop early.

```xml
<completeness_contract>
Complete the requested outcome and required verification before stopping.
For implementation, apply the fix rather than ending with a diagnosis or plan. For discussion, diagnosis, or review, return the requested analysis without expanding into edits.
Include follow-on changes only when necessary for the authorized result.
</completeness_contract>
```

### `verification_loop`

Use when correctness matters.

```xml
<verification_loop>
Before finalizing, verify the result against the task requirements and the changed files or tool outputs.
Run required checks and tests relevant to the changed behavior. If a check fails, address the failure or report the unresolved limitation.
Once checks pass, broaden or repeat them only for new changes, failures, or unresolved concerns. Avoid tests that merely restate low-impact edits.
</verification_loop>
```

## Grounding and Missing Context

### `missing_context_gating`

Use when Codex might otherwise guess.

```xml
<missing_context_gating>
Do not guess missing repository facts.
If required context is absent, retrieve it with tools or state exactly what remains unknown.
</missing_context_gating>
```

### `grounding_rules`

Use for review, research, or root-cause analysis.

```xml
<grounding_rules>
Ground every claim in the provided context or your tool outputs.
Do not present inferences as facts.
If a point is a hypothesis, label it clearly.
</grounding_rules>
```

### `citation_rules`

Use when external research or quotes matter.

```xml
<citation_rules>
Back important claims with citations or explicit references to the source material you inspected.
Prefer primary sources.
</citation_rules>
```

## Safety and Scope

### `action_safety`

Use for write-capable or potentially broad tasks.

```xml
<action_safety>
Keep changes tightly scoped to the stated task.
Avoid unrelated refactors, renames, or cleanup unless they are required for correctness.
Obtain approval for actions outside existing authorization after preparing the reviewable result. Retain applicable tool permissions.
Explicit user instructions take precedence over skill guidance, subject to higher-priority instructions. If a skill blocks progress, cite its exact file and instruction and explain the blocker.
</action_safety>
```

### `tool_persistence_rules`

Use for long-running tool-heavy tasks.

```xml
<tool_persistence_rules>
Keep using tools until you have enough evidence to finish the task confidently.
Do not abandon the workflow after a partial read when another targeted check would change the answer.
</tool_persistence_rules>
```

## Task-Specific Blocks

### `research_mode`

Use for exploration, comparisons, or recommendations.

```xml
<research_mode>
Separate observed facts, reasoned inferences, and open questions.
Prefer breadth first, then go deeper only where the evidence changes the recommendation.
</research_mode>
```

### `dig_deeper_nudge`

Use for review and adversarial inspection.

```xml
<dig_deeper_nudge>
Trace relevant failure paths, including empty states, retries, stale state, and rollback where the change touches them.
Finish when each candidate is supported or discarded and the scoped review is covered; return no findings when none meets the evidence bar.
</dig_deeper_nudge>
```

### `progress_updates`

Use when the run may take a while.

```xml
<progress_updates>
If you provide progress updates, keep them brief and outcome-based.
Mention only major phase changes or blockers.
</progress_updates>
```
