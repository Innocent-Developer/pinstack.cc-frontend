/** Suggested languages / frameworks for tech stack picker. */
export const TECH_STACK_SUGGESTIONS = [
  'Next.js',
  'React',
  'Vue',
  'Nuxt',
  'Angular',
  'Svelte',
  'TypeScript',
  'JavaScript',
  'Python',
  'Node.js',
  'Go',
  'Rust',
  'Java',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'C#',
  '.NET',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Supabase',
  'Firebase',
  'AWS',
  'Docker',
  'Tailwind',
  'Express',
  'Django',
  'FastAPI',
  'Laravel',
  'GraphQL',
  'Prisma',
] as const;

export function parseListInput(raw: string, max = 12): string[] {
  return [
    ...new Set(
      raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    ),
  ].slice(0, max);
}

export function toggleStackItem(selected: string[], item: string, max = 12): string[] {
  const has = selected.some((s) => s.toLowerCase() === item.toLowerCase());
  if (has) return selected.filter((s) => s.toLowerCase() !== item.toLowerCase());
  if (selected.length >= max) return selected;
  return [...selected, item];
}
