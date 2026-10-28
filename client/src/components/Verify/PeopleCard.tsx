import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';
import { isComposing } from '../common/keys';
import { BUTTON_GHOST, BUTTON_REMOVE, CARD, CARD_TITLE } from '../common/styles';

import { useBillStore } from '../../store/billStore';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_NAME_LENGTH, MAX_PEOPLE } from '../../constants/config';

/**
 * Everyone on the bill, one row each with a remove control, and an "Add person" row that turns into a name field
 * in place. Enter adds the name and keeps the field open for the next, leaving it adds and closes, and Escape cancels.
 * @returns The people card
 */
export const PeopleCard: React.FC = () => {
  const people = useBillStore((s) => s.people);
  const addPerson = useBillStore((s) => s.addPerson);
  const removePerson = useBillStore((s) => s.removePerson);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const handleAdd = () => {
    if (people.length >= MAX_PEOPLE) return;
    // Render the field and focus it within the same tap: mobile browsers only raise the keyboard for a focus()
    // made inside the user gesture.
    flushSync(() => setIsAdding(true));
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const trimmed = newName.trim();
    if (trimmed) addPerson(trimmed);
    setNewName('');
    setIsAdding(false);
  };

  // Close the field from the keyboard and hand focus to the Add person button that renders in its place.
  const closeField = () => {
    setNewName('');
    flushSync(() => setIsAdding(false));
    addButtonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComposing(e)) return;
    if (e.key === 'Escape') closeField();
    if (e.key !== 'Enter') return;
    // Focus may move to a button below, so stop this Enter from also clicking it.
    e.preventDefault();
    // Enter adds the name and keeps the field open for the next one, until it's left empty or the bill is full.
    const trimmed = newName.trim();
    if (trimmed) addPerson(trimmed);
    if (!trimmed || people.length + 1 >= MAX_PEOPLE) closeField();
    else setNewName('');
  };

  // A removed row takes focus with it, so hand it to Add person. Only a key press scrolls there: a tap stays put,
  // keeping the next row under the finger.
  const handleRemove = (id: string, isKeyboard: boolean) => {
    removePerson(id);
    addButtonRef.current?.focus({ preventScroll: true });
    if (isKeyboard) addButtonRef.current?.scrollIntoView({ block: 'nearest' });
  };

  return (
    <section aria-label="People" className={CARD}>
      <div className="flex items-baseline justify-between pb-1.5 pl-[18px] pr-4 pt-4">
        <h2 className={CARD_TITLE}>People</h2>
        {people.length > 0 && <span className="text-[13px] text-ink-3">{people.length}</span>}
      </div>
      <div className="pl-[18px] pr-2">
        <AnimatePresence initial={false}>
          {people.map((person) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 44 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE.out }}
              className="flex items-center gap-2.5 overflow-hidden border-b border-line-soft"
            >
              <Avatar name={person.name} color={person.color} />
              <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{person.name}</span>
              <button type="button" onClick={(e) => handleRemove(person.id, e.detail === 0)} aria-label={`Remove ${person.name}`} className={BUTTON_REMOVE}>
                <Icon name="cross" size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="px-2.5 pb-2.5 pt-1.5">
        {isAdding ? (
          <div className="field flex h-10 items-center px-3">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              placeholder="Name"
              aria-label="New person's name"
              maxLength={MAX_NAME_LENGTH}
              autoCapitalize="words"
              className="w-full self-stretch bg-transparent text-sm placeholder:text-ink-3"
            />
          </div>
        ) : (
          <button
            ref={addButtonRef}
            type="button"
            onClick={handleAdd}
            aria-disabled={people.length >= MAX_PEOPLE}
            className={`h-10 w-full px-2 text-sm ${BUTTON_GHOST}`}
          >
            <Icon name="plus" />
            Add person
          </button>
        )}
      </div>
    </section>
  );
};
