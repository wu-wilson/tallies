---
paths:
  - "client/**/*.ts"
  - "client/**/*.tsx"
  - "server/**/*.ts"
---

# Code Style

## TypeScript

- Strict mode enabled. No `any` — use `unknown` with type narrowing. Prefer `interface` for object shapes, `type` for unions and intersections.
- Functional components: `const` arrow functions with `React.FC<Props>`.
- Props interfaces named `{ComponentName}Props`, defined directly above the component.
- Named exports only — no default exports.

## Docstrings

- Every exported function, hook, component, and type must have a JSDoc docstring.
- **Functions, hooks, components:** structure is one-sentence overview (extend to a second sentence when extra context helps), then `@param name - description` for each parameter, then `@returns description` (omit `@returns` only on void functions). Both tags are mandatory — never "as appropriate".
- **Types/interfaces:** one-line overview is sufficient. Add inline `/** one-line description */` on individual fields that need explanation; leave self-evident fields untagged.
- `@param`/`@returns` descriptions are prose only — don't restate the TypeScript type. Add semantic info the signature doesn't carry (units, formats, ranges, null-vs-empty semantics, side effects, retry behavior).
- Don't use `@throws` — describe error/failure semantics in the prose overview or via a result shape (e.g. an `error` field on the return object).
- Internal (non-exported) helpers: one-line `/** … */` only when the name doesn't carry the whole meaning.

## Imports

- Group with blank lines: React/third-party → Components → Hooks/stores → Utils → Constants → Types (via `import type`).
- Alphabetical within groups.

## Naming

- Event handlers: `handle{Event}`. Hooks: `use{Name}`. Booleans: `is`/`has`/`should`.
- PascalCase for component files, camelCase for utilities and hooks.

## Patterns

- Pure functions, early returns, no deep nesting.
- Try/catch all async operations with meaningful error messages.
- No dead code or unused imports.
- No `console.log` in client code. Server/cron may use `console.*` for operational logging only (request outcomes, lifecycle, errors) — not for debugging.
