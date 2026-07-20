'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-borderC border border-borderC rounded-card overflow-hidden">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
            className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-bgAlt transition"
          >
            <span className="text-sm font-semibold text-heading">{item.q}</span>
            <span className="text-primary text-lg shrink-0">{openIndex === i ? '−' : '+'}</span>
          </button>
          <div
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: openIndex === i ? '200px' : '0px' }}
          >
            <p className="px-5 pb-4 text-sm text-muted">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
