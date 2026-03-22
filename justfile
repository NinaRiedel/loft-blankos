set shell := ["bash", "-euo", "pipefail", "-c"]
help:
  @printf '\n'
  @printf 'Core\n'
  @printf '  check-fix             Apply lint + format fixes.\n'
  @printf '  typecheck             TypeScript checks without emit. Runs top-level.\n'
  @printf '  build                 Build TS project refs / artifacts.\n'
  @printf '  test                  Run tests.\n'
  @printf '\n'
  @printf 'Runtime\n'
  @printf '  dev                   Run vite dev mode.\n'
  @printf '\n'

check-fix:
  pnpm run check:fix

build:
  pnpm run build

typecheck:
  pnpm run typecheck

dev:
  pnpm run dev

test:
  pnpm run test
