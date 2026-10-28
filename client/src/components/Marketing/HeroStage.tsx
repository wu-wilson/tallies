import React from 'react';

import { Avatar } from '../common/Avatar';
import { AvatarPile } from '../common/AvatarPile';
import { Icon } from '../common/Icon';
import { VenmoWordmark } from '../Result/VenmoWordmark';
import { HeroArt } from './HeroArt';

import { DEMO_ITEMS, DEMO_SHARES } from './demo';

/** Shared look of the cards floating over the art. */
const FLOAT = 'absolute rounded-xl border border-ink/[0.08] bg-surface shadow-float';

/**
 * The hero's live demo over the giant tally: a receipt whose items get their people one by one, the bill's split
 * filling in, and Jordan's card paying Alex on Venmo. The loop is pure CSS (`demo-*` in `index.css`) and rests on
 * a complete still under reduced motion.
 * @returns The art with its floating cards
 */
export const HeroStage: React.FC = () => (
  <div className="relative -mx-5 min-h-[35rem] sm:-mx-6 sm:min-h-[37.5rem] lg:mx-0 lg:min-h-[40rem]" aria-hidden="true">
    {/* Below `lg` the art shrinks to fit the width and the cards re-stack over it. */}
    <HeroArt className="absolute left-1/2 top-0 h-auto w-full max-w-[640px] -translate-x-1/2 lg:left-0 lg:h-full lg:max-w-none lg:translate-x-0" />

    <div className={`${FLOAT} left-[max(24px,calc(50%-300px))] top-[120px] w-[calc(100%-72px)] sm:top-[150px] sm:w-[296px] lg:left-0 lg:top-[168px]`}>
      <div className="flex h-[42px] items-center gap-2 border-b border-line px-3.5">
        <Icon name="receipt" size={14} className="text-ink-3" />
        <span className="flex-1 text-[13px] font-medium">Sushi Ran</span>
        <span className="text-xs text-ink-3">6 items</span>
      </div>
      <div className="px-3.5 pb-3 pt-1 text-xs">
        {DEMO_ITEMS.map((item, i) => (
          <div
            key={item.name}
            className={`demo-row-${i + 1} -mx-2 grid h-8 grid-cols-[minmax(0,1fr)_54px_44px] items-center gap-x-2.5 rounded-md border-b border-line-soft px-2`}
          >
            <span className="truncate">{item.name}</span>
            <span className={`demo-pile-${i + 1}`}>
              <AvatarPile people={item.people} />
            </span>
            <span className="text-right">{item.price}</span>
          </div>
        ))}
        <div className="flex flex-col gap-0.5 pt-2 text-ink-3">
          <div className="flex justify-between"><span>Tax 8%</span><span>12.56</span></div>
          <div className="flex justify-between"><span>Tip 20%</span><span>31.40</span></div>
          <div className="flex justify-between font-medium text-ink"><span>Total</span><span>$200.96</span></div>
        </div>
      </div>
    </div>

    {/* The split card hides on phones and from 1024 to 1159px, where the column is too narrow for it
        beside the receipt. */}
    <div className={`${FLOAT} right-[max(24px,calc(50%-300px))] top-[60px] hidden w-[256px] sm:block lg:right-0 lg:top-14 lg:hidden min-[1160px]:block`}>
      <div className="flex h-[42px] items-center justify-between border-b border-line px-3.5">
        <span className="text-[13px] font-medium">Tahoe weekend</span>
        <span className="text-xs text-ink-3">$244.48</span>
      </div>
      <div className="px-3.5 pb-2 pt-1 text-[12.5px]">
        {DEMO_SHARES.map(({ person, amount }, i) => (
          <div key={person.id} className="flex h-9 items-center gap-2.5 border-b border-line-soft last:border-b-0">
            <Avatar name={person.name} color={person.color} size="sm" />
            <span className="flex-1">
              {person.name}
              {i === 0 && <span className="text-ink-3"> paid</span>}
            </span>
            <span className={`demo-share-${i + 1}`}>{amount}</span>
          </div>
        ))}
      </div>
    </div>

    <div className={`${FLOAT} demo-card bottom-7 right-[max(24px,calc(50%-280px))] w-[210px] p-4 sm:w-60 lg:bottom-[52px] lg:right-[14%]`}>
      <div className="text-xs text-ink-3">Jordan owes Alex</div>
      <div className="mt-0.5 text-[30px] font-light leading-tight tracking-[-0.04em]">$75.84</div>
      <div className="demo-press relative mt-3 flex h-9 items-center justify-center gap-1.5 rounded-md bg-venmo text-white">
        <span className="text-[13px] font-medium">Pay with</span>
        <VenmoWordmark className="text-sm text-white" />
        <span className="demo-paid absolute inset-0 flex items-center justify-center gap-1.5 rounded-md bg-settled text-[13px] font-medium">
          <Icon name="check" size={13} />
          Paid
        </span>
      </div>
    </div>
  </div>
);
