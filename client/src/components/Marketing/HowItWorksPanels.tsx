import React from 'react';

import { Avatar } from '../common/Avatar';
import { AvatarPile } from '../common/AvatarPile';
import { Icon } from '../common/Icon';
import { VenmoWordmark } from '../Result/VenmoWordmark';

import { DEMO_ITEMS, DEMO_PEOPLE, DEMO_SHARES } from './demo';

/** Shared look of the small product card inside each panel. */
const PANEL_CARD = 'w-full max-w-[440px] rounded-xl border border-ink/[0.08] bg-surface shadow-float';

interface PanelHeaderProps {
  title: string;
  meta: string;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ title, meta }) => (
  <div className="flex h-11 items-center justify-between border-b border-line px-4">
    <span className="text-[13px] font-medium">{title}</span>
    <span className="text-xs text-ink-3">{meta}</span>
  </div>
);

const SCANS = [
  { name: 'Sushi Ran', detail: '6 items · $157.00', isRead: true },
  { name: 'Alibi Ale Works', detail: '4 items · $34.00', isRead: true },
  { name: 'IMG_4038.jpg', detail: 'Reading the items', isRead: false },
];

/**
 * Step 1's screen: three receipts being read, two done and one still spinning.
 * @returns The scan panel card
 */
export const ScanPanel: React.FC = () => (
  <div className={PANEL_CARD}>
    <PanelHeader title="Receipts" meta="2 of 3 read" />
    <div className="px-4 pb-2.5 pt-1.5 text-[12.5px]">
      {SCANS.map((scan) => (
        <div key={scan.name} className="flex min-h-[52px] items-center gap-3 border-b border-line-soft last:border-b-0">
          <span className="h-[34px] w-[26px] shrink-0 rounded-[3px] border border-line bg-line-soft" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{scan.name}</span>
            <span className="block text-[11.5px] text-ink-3">{scan.detail}</span>
          </span>
          {scan.isRead ? (
            <span className="flex items-center gap-1.5 text-xs text-settled">
              <Icon name="check" size={13} />
              Read
            </span>
          ) : (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-ink" />
          )}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Step 2's screen: a receipt with its items' people, and the picker open on "Sake flight".
 * @returns The assign panel card with its floating picker
 */
export const AssignPanel: React.FC = () => {
  const items = [DEMO_ITEMS[0], DEMO_ITEMS[2], DEMO_ITEMS[3]];
  const picked = new Set(DEMO_ITEMS[3].people.map((p) => p.id));
  return (
    // The bottom padding matches the picker's overhang, so the panel centres the card and picker together.
    <div className="relative w-full max-w-[440px] pb-28">
      <div className={PANEL_CARD}>
        <PanelHeader title="Sushi Ran" meta="6 items" />
        <div className="px-4 pb-2 pt-1 text-[12.5px]">
          {items.map((item) => (
            <div key={item.name} className="grid h-11 grid-cols-[minmax(0,1fr)_70px_48px] items-center gap-x-2.5 border-b border-line-soft last:border-b-0">
              <span className="truncate">{item.name}</span>
              <AvatarPile people={item.people} />
              <span className="text-right">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-2 top-[128px] w-48 rounded-[10px] border border-ink/[0.08] bg-surface p-1.5 text-[12.5px] shadow-float sm:-right-3">
        <div className="px-2 pb-1 pt-1.5 text-[11.5px] text-ink-3">Who had Sake flight?</div>
        {Object.values(DEMO_PEOPLE).map((person) => (
          <div key={person.id} className={`flex h-8 items-center gap-2 rounded-md px-2 ${picked.has(person.id) ? 'bg-wash' : ''}`}>
            <Avatar name={person.name} color={person.color} size="sm" />
            <span className="flex-1">{person.name}</span>
            {picked.has(person.id) && <Icon name="check" size={13} className="text-settled" />}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Step 3's screen: the shared bill as a friend sees it, with Jordan's pay button under their name.
 * @returns The share panel card
 */
export const SharePanel: React.FC = () => (
  <div className={PANEL_CARD}>
    <PanelHeader title="Tahoe weekend" meta="Shared by Alex" />
    <div className="px-4 pb-3.5 pt-1 text-[12.5px]">
      {DEMO_SHARES.map(({ person, amount }, i) => (
        <React.Fragment key={person.id}>
          <div className={`flex h-11 items-center gap-2.5 ${i < DEMO_SHARES.length - 1 ? 'border-b border-line-soft' : ''}`}>
            <Avatar name={person.name} color={person.color} size="md" />
            <span className={`flex-1 ${i === 1 ? 'font-medium' : ''}`}>
              {person.name}
              {i === 0 && <span className="text-settled"> paid</span>}
            </span>
            <span>{amount}</span>
          </div>
          {i === 1 && (
            <div className="my-2.5 flex h-9 items-center justify-center gap-1.5 rounded-md bg-venmo text-white">
              <span className="text-[13px] font-medium">Pay Alex $75.84</span>
              <VenmoWordmark className="text-sm text-white" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);
