'use client';

import { TECH_STACK_SUGGESTIONS, toggleStackItem } from '../lib/techStack';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

/** Multi-select chips + custom comma input for languages / frameworks. */
export default function TechStackPicker({ value, onChange, max = 12 }: Props) {
  const custom = value.filter(
    (v) => !TECH_STACK_SUGGESTIONS.some((s) => s.toLowerCase() === v.toLowerCase())
  );

  return (
    <div>
      <label className="block text-xs font-semibold text-heading mb-1">
        Tech stack{' '}
        <span className="text-muted font-medium">(languages, frameworks, databases)</span>
      </label>
      <p className="text-[11px] text-muted mb-2">
        {value.length}/{max} selected — shown on your product page.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TECH_STACK_SUGGESTIONS.map((item) => {
          const active = value.some((v) => v.toLowerCase() === item.toLowerCase());
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(toggleStackItem(value, item, max))}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-borderC text-heading hover:border-primary/50 bg-white'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      <input
        value={custom.join(', ')}
        onChange={(e) => {
          const extras = e.target.value
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
          const fromSuggestions = value.filter((v) =>
            TECH_STACK_SUGGESTIONS.some((s) => s.toLowerCase() === v.toLowerCase())
          );
          onChange([...fromSuggestions, ...extras].slice(0, max));
        }}
        placeholder="Or type others, comma separated (e.g. Elixir, Flutter)"
        className="w-full px-3 py-2.5 border border-borderC rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
      />
    </div>
  );
}
