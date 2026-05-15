# Repository Guidelines

## Project Structure & Module Organization

- `src/index.ts`: plugin entry point exported to consumers.
- `src/rules/index.ts`: aggregates built-in rules and flat configs.
- `src/rules/<rule-name>/`: one directory per rule, typically with `index.ts` and `index.test.ts`.
- `src/utils/`: cross-rule and general-purpose utilities.
- `src/types/`: public type declarations used across the plugin.
- `tests/fixtures/`: integration tests that exercise the full rule set with Markdown input/output fixture pairs.
- `tests/utils/`: utility-level and cross-rule unit test.
- `docs/rules/`: rule documentation that should stay in sync with behavior changes.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies and set up git hooks.
- `pnpm build`: bundle the plugin into `dist/` with `tsdown`.
- `pnpm dev`: rebuild on file changes during local development.
- `pnpm lint`: run ESLint across the repository.
- `pnpm lint:fix`: apply safe lint fixes.
- `pnpm test`: run the Vitest suite.
- `pnpm test:cov`: run tests with V8 coverage output.
- `pnpm typecheck`: verify TypeScript types without emitting files.

## Coding Style & Naming Conventions

This is a TypeScript ESM library targeting Node `>=20.19.0`. Follow the existing `@antfu/eslint-config` rules: no semicolons, single quotes, and concise typed exports. Prefer the `@/` alias for internal imports; `src/...` imports are explicitly rejected by the local ESLint rule. Keep rule directories kebab-cased (`space-around-word`) and export constants such as `RULE_NAME` from each rule module.

## Testing Guidelines

Vitest is the test runner. Name tests `*.test.ts` and keep rule-specific tests next to the rule when practical; broader utility and fixture tests belong in `tests/`. Use `eslint-vitest-rule-tester` for rule behavior and `tests/fixtures/input` and `tests/fixtures/output` for Markdown fix snapshots. Run `pnpm test` before opening a PR and `pnpm test:cov` when touching parser or fixer logic.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits, for example `fix(valid-heading-anchor): ...`, `refactor(types): ...`, and `chore: ...`. Keep subjects imperative and scoped when useful. Pull requests should describe the user-visible change, list affected rules or docs, link the issue when applicable, and include before/after Markdown examples for fixer changes. Ensure `pnpm lint`, `pnpm test`, and `pnpm typecheck` pass before requesting review.
