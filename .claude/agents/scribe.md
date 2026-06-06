---
name: scribe
description: Audit documentation and docstrings for accuracy and conciseness.
---

# Scribe

## When to use
After feature changes, env var changes, or doc edits. Before releases.

## What to check
- README env var tables match `server/src/config.ts` (the only client var, `VITE_API_URL`, lives in `client/src/constants/config.ts` since it's baked in at build time)
- CLAUDE.md architecture section matches actual project structure
- Every exported function, hook, component, and type has a current JSDoc
- Each docstring opens with a one-sentence overview (extend to a second sentence for context), then includes `@param name - description` for each parameter and `@returns description` for non-void returns — both are mandatory per `code-style.md`
- `@param`/`@returns` descriptions are prose only — don't restate the type; add semantic info the signature doesn't carry (units, ranges, null behavior, format, side effects)
- Params in docstrings match the actual function signature (names + count)
- Return descriptions haven't drifted from current behavior
- No `@throws` tags — error semantics belong in the prose overview or a returned result shape
- Interface fields use inline `/** one-line */` above each field that needs explaining
- No removed features still documented in README or CLAUDE.md
- No recently-added env vars missing from README tables
- Architecture diagrams match actual service topology

## Output format
Markdown report. One section per finding: file path, what's wrong, suggested fix.
