# Bersu Design System

The UI system is token-first, deliberately bright, and designed around restrained gold accents rather than decorative luxury cues. `--gold` indicates value, selection, and premium actions; it is never used as body text on white unless `--gold-strong` is used.

## Usage rules

- Import components from `@/components/ui`.
- Use `primary` for the main action in a decision area. Use `gold` only for premium, publishing, or conversion-oriented actions.
- Keep one `Card` visual level per surface. Avoid cards inside cards unless the inner element is an explicit data grouping.
- Use the responsive grid and spacing primitives instead of page-specific column utilities where the layout is reusable.
- Use `Field`, `Label`, and error messages consistently with React Hook Form. Form validation remains in Zod schemas, not component state.
- Every dialog must have an accessible title and a clearly labelled destructive action when relevant.
- Charts receive already formatted domain data. Never put query or business logic in chart components.

## Dark mode

Tokens are semantic, not literal. Components use `surface`, `ink`, `line`, and `gold` tokens, so the `dark` class changes the entire system without individual component rewrites. `ThemeToggle` persists the user choice under `bersu-theme`.

## Brand asset handoff

Replace `BrandMark` with the supplied Bersu Invest logo once it is available in the application asset pipeline. Keep the component public API unchanged so public and dashboard navigation remain stable.
