Review the specified files (or the entire `src/` directory if none specified) following these guidelines. Read each file before reviewing it. 


## Review Checklist

### Svelte 5 / SvelteKit
- Code scope for review: $ARGUMENTS
- Uses runes (`$state`, `$derived`, `$effect`, `$props`) — flag any legacy `export let`, `onMount`, or Svelte 4 patterns
- Proper reactive patterns (no direct mutation of derived state, no unnecessary effects)
- Correct use of SvelteKit routing (`+page.svelte`, `+layout.svelte`, `+error.svelte`)
- Cleanup logic in `$effect` return functions where needed

### Firebase
- Firestore listeners unsubscribe on cleanup (no memory leaks)
- No client-side secrets or service account keys exposed
- Efficient queries (batched reads/writes, avoid redundant reads)
- Security rules follow least-privilege (review `firestore.rules`, `storage.rules` if in scope)

### Performance & Accessibility
- Lazy loading for images and heavy assets
- Semantic HTML and ARIA attributes where needed
- Responsive/mobile-first design
- EmulatorJS globals cleaned up on component destroy

### Code Quality
- TypeScript types used correctly (no `any` without justification)
- Consistent naming and file organization matching `src/lib/` conventions
- No unused imports or dead code

## Output Format

Structure your review as:
1. **Summary** — one-line overall assessment
2. **Strengths** — what's done well
3. **Issues** — problems ranked by severity (critical > warning > nit), with file paths and line numbers
4. **Suggestions** — optional improvements, with code snippets where helpful

$ARGUMENTS