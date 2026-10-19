# Codex Prompt Recipes

Use these as starting templates for Codex task prompts or other Codex/GPT-6.1 Sol or GPT-6 Astra prompt construction.
Copy the smallest recipe that fits the task, then trim anything you do not need.
In `codex:codex-rescue`, use read-only mode for diagnosis, review, or research without requested edits. Use write mode for authorized implementation. Copy relevant blocks from [prompt blocks](prompt-blocks.md) when the task needs explicit scope, instruction precedence, or continuation rules.

## Diagnosis

```xml
<task>
Diagnose why the failing test or command is breaking in this repository.
Use the available repository context and tools to identify the most likely root cause.
</task>

<compact_output_contract>
Return a compact diagnosis with:
1. most likely root cause
2. evidence
3. smallest safe next step
</compact_output_contract>

<default_follow_through_policy>
Keep going until you have enough evidence to identify the root cause confidently.
Retrieve missing evidence with tools where possible. Ask only when an unavailable detail materially changes the diagnosis, and continue independent investigation while blocked.
Keep this diagnosis read-only unless the user also requests a fix.
</default_follow_through_policy>

<verification_loop>
Before finalizing, verify that the proposed root cause matches the observed evidence.
</verification_loop>

<missing_context_gating>
Do not guess missing repository facts.
If required context is absent, state exactly what remains unknown.
</missing_context_gating>
```

## Narrow Fix

```xml
<task>
Implement the smallest safe fix for the identified issue in this repository.
Preserve existing behavior outside the failing path.
</task>

<structured_output_contract>
Return:
1. summary of the fix
2. touched files
3. verification performed
4. residual risks or follow-ups
</structured_output_contract>

<default_follow_through_policy>
Make routine reversible choices within the authorized fix and keep going through implementation and verification.
Ask only about consequential missing information or actions outside authorization; continue independent authorized work while blocked.
</default_follow_through_policy>

<completeness_contract>
Resolve the task fully before stopping.
Do not stop after identifying the issue without applying the fix.
</completeness_contract>

<verification_loop>
Run required checks and tests relevant to the changed behavior. Once they pass, repeat or broaden testing only for new changes, failures, or unresolved concerns.
Report any verification that could not be completed.
</verification_loop>

<action_safety>
Keep changes tightly scoped to the stated task.
Avoid unrelated refactors or cleanup.
</action_safety>
```

## Root-Cause Review

```xml
<task>
Analyze this change for the most likely correctness or regression issues.
Focus on the provided repository context only.
</task>

<structured_output_contract>
Return:
1. findings ordered by severity
2. supporting evidence for each finding
3. brief next steps
</structured_output_contract>

<grounding_rules>
Ground every claim in the repository context or tool outputs.
If a point is an inference, label it clearly.
</grounding_rules>

<dig_deeper_nudge>
Trace failure paths relevant to this change, including empty states, retries, stale state, and rollback where applicable.
Return no findings if none is supported; keep the review read-only.
</dig_deeper_nudge>

<verification_loop>
Before finalizing, verify that each finding is material and actionable.
</verification_loop>
```

## Research Or Recommendation

```xml
<task>
Research the available options and recommend the best path for this task.
</task>

<structured_output_contract>
Return:
1. observed facts
2. reasoned recommendation
3. tradeoffs
4. open questions
</structured_output_contract>

<research_mode>
Separate observed facts, reasoned inferences, and open questions.
Prefer breadth first, then go deeper only where the evidence changes the recommendation.
</research_mode>

<citation_rules>
Back important claims with explicit references to the sources you inspected.
Prefer primary sources.
</citation_rules>
```

## Prompt-Patching

```xml
<task>
Diagnose why this existing prompt is underperforming and propose the smallest high-leverage changes to improve it for Codex or GPT-6.1 Sol or GPT-6 Astra.
</task>

<structured_output_contract>
Return:
1. failure modes
2. root causes in the current prompt
3. a revised prompt
4. why the revision should work better
</structured_output_contract>

<grounding_rules>
Base your diagnosis on the prompt text and the failure examples provided.
Do not invent failure modes that are not supported by the examples.
</grounding_rules>

<verification_loop>
Before finalizing, make sure the revised prompt resolves the cited failure modes without adding contradictory instructions.
</verification_loop>
```
