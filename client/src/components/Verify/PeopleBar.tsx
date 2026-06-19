import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_PEOPLE, MAX_NAME_LENGTH } from '../../constants/config';
import { useBillStore } from '../../store/billStore';
import { Avatar } from '../common/Avatar';

/**
 * Wrapped row of people on the bill, each a bordered pill, with an inline autofocus input for adding more.
 * @returns The "PEOPLE" section — person pills plus the add control
 */
export const PeopleBar: React.FC = () => {
  const { people, addPerson, removePerson } = useBillStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    // Render the input synchronously, then focus it within the same tap — mobile Safari/Chrome only raise the
    // keyboard when focus() happens inside the user gesture (a deferred focus is ignored there).
    flushSync(() => setIsAdding(true));
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const trimmed = newName.trim();
    if (trimmed) addPerson(trimmed);
    setNewName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-ink-faint">PEOPLE</span>
        {people.length > 0 && (
          <span className="font-mono text-[10px] text-ink-ghost">
            {people.length}/{MAX_PEOPLE}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <AnimatePresence mode="popLayout">
          {people.map((person) => (
            <motion.div
              key={person.id}
              layout
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={EASE.spring}
              className="flex max-w-[170px] shrink-0 items-center gap-2 border border-ink bg-paper-raised py-1.5 pl-1.5 pr-2.5"
            >
              <Avatar name={person.name} color={person.color} size="sm" />
              <span className="truncate text-sm font-bold text-ink">{person.name}</span>
              <button
                onClick={() => removePerson(person.id)}
                className="shrink-0 text-base font-bold leading-none text-ink-faint transition-[filter] hover:text-status-error"
                aria-label={`Remove ${person.name}`}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {isAdding ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: DURATION.fast }}>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Alex"
              maxLength={MAX_NAME_LENGTH}
              className="w-32 border border-ink bg-paper-raised px-3 py-2 text-sm font-bold text-ink outline-none placeholder:font-normal placeholder:text-ink-ghost"
              autoCapitalize="words"
            />
          </motion.div>
        ) : people.length < MAX_PEOPLE ? (
          <motion.button
            onClick={handleAdd}
            className="flex shrink-0 items-center gap-1.5 border-2 border-dashed border-ink-faint px-3 py-2 text-sm font-bold text-ink-faint transition-[filter] hover:text-ink"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-base leading-none">+</span>
            {people.length === 0 ? 'Add person' : 'Add'}
          </motion.button>
        ) : null}
      </div>
    </div>
  );
};
