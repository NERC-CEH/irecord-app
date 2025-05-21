# Best Practices for Using React

- Use functional components and React Hooks.
- Keep components small, focused, and reusable.
- Lift state up only when necessary.
- Use Context API or state management libraries for global state.
- Memoize expensive computations and components with `useMemo` and `React.memo`.
- Avoid prop drilling by using context or composition.
- Write unit and integration tests for components.
- Use PropTypes or TypeScript for type checking.
- Keep side effects in `useEffect` and clean them up properly.
- Follow naming conventions and organize files logically.
- Use descriptive and consistent naming for components and hooks.

## Javascript/Typescript Best Practices

- Don't use `finally` in try catch blocks.
- Use extra line spacing between logical code blocks.
- if blocks must be surrounded by empty lines.
- Add short general purpose comments to code sections.
- Add comments to edge cases.
- Comments should start with lower case.
- All arrow functions must be named, assigned to a variable.
- When adding comments for debugging purposes, use console.debug(''), start the comment with a '🔵' emoji.
- Prefer template literals over string concatenation.
- Avoid magic numbers and strings; use constants or enums.

## Other

- Write meaningful commit messages.
- Use Conventional Commits Specification v1.0.0
- Commit messages must be under 50 characters long.

- Use Prettier and ESLint for consistent code formatting.
