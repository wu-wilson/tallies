import React from 'react';

const SPECS = [
  { title: 'Tax and tip by share', body: 'Everyone covers tax and tip in proportion to what they ordered.' },
  { title: 'Shared plates', body: 'Split any item between two people, or the whole table.' },
  { title: 'Several receipts', body: 'Dinner and drinks become one bill, each at its own rates.' },
  { title: 'One link for everyone', body: 'Friends see their share and pay on Venmo without an account.' },
];

/** Hairlines and gutters per cell: stacked on phones, a 2×2 grid on tablets, one row of four on desktop. */
const CELL_LINES = [
  'sm:pr-6',
  'border-t sm:border-l sm:border-t-0 sm:pl-6 lg:pr-6',
  'border-t sm:pr-6 lg:border-l lg:border-t-0 lg:pl-6',
  'border-t sm:border-l sm:pl-6 lg:border-t-0',
];

/**
 * "Fair to everyone at the table": a two-tone headline over four short specs between hairlines, four across on
 * desktop, two on tablets and one on phones.
 * @returns The specs section
 */
export const Specs: React.FC = () => (
  <section className="px-5 pt-24 sm:px-6">
    <div className="mx-auto max-w-[1200px]">
      <h2 className="max-w-[640px] text-[clamp(28px,2.6vw,38px)] font-light leading-[1.12] tracking-[-0.03em] [text-wrap:balance]">
        Fair to everyone at the table. <span className="text-ink-4">Even the one who only had soup.</span>
      </h2>
      <dl className="mt-10 grid border-y border-line sm:grid-cols-2 lg:grid-cols-4">
        {SPECS.map((spec, i) => (
          <div key={spec.title} className={`border-line py-6 ${CELL_LINES[i]}`}>
            <dt className="text-[13px] font-medium">{spec.title}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-2">{spec.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);
