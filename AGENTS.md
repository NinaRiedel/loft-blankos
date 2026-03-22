## Rules

- When you write comments, describing the "why" or "what", if not obvious from code, never the "how".
- Never include jsdoc type hints, just use typescript types.
- Typesafety over type casts and defensive programming. Parse, don't validate.
- Write economic, high-impact tests. Avoid tests that are already validated by the type system.
- When a user provided command doesn't work, highlight this for the user to fix.
- Keep documentation in sync with code changes.

## Testing

- Group test cases using `.each`, as opposed to writing individual test cases.
    - Provide `expected`, `input`, `description`, etc in the each objects.
    - Avoid using conditional asserts.

## Commands

We're mainly using pnpm scripts via `just`. Run `just` to check all available commands.

Essentials:
- typescript: `just typecheck`
- lint+format fix: `just check-fix`
- unit tests: `just test`
