import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_PEOPLE, MAX_NAME_LENGTH } from '../../constants/config';
import { useBillStore } from '../../store/billStore';
import { Avatar } from '../common/Avatar';

/**
 * Horizontal pill list of people on the bill, with an inline autofocus input for adding more.
 * @returns Wrapped row of person pills plus the add control
 */
export const PeopleBar: React.FC = () => {
  const { people, addPerson, removePerson } = useBillStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 50);
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
        <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
          People
        </span>
        {people.length > 0 && (
          <span className="font-mono text-[10px] text-text-tertiary">
            {people.length}/{MAX_PEOPLE}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AnimatePresence mode="popLayout">
          {people.map((person) => (
            <motion.div
              key={person.id}
              layout
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={EASE.spring}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-secondary py-1 pl-1 pr-1.5"
            >
              <Avatar name={person.name} color={person.color} size="sm" />
              <span className="text-xs font-medium text-text-primary">{person.name}</span>
              <button
                onClick={() => removePerson(person.id)}
                className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label={`Remove ${person.name}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {isAdding ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: DURATION.fast }}
          >
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Alex"
              maxLength={MAX_NAME_LENGTH}
              className="h-8 w-28 rounded-full bg-bg-secondary px-3 text-xs text-text-primary outline-none placeholder:text-text-tertiary"
              autoCapitalize="words"
            />
          </motion.div>
        ) : people.length < MAX_PEOPLE ? (
          <motion.button
            onClick={handleAdd}
            className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand"
            whileTap={{ scale: 0.95 }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {people.length === 0 ? 'Add person' : 'Add'}
          </motion.button>
        ) : null}
      </div>
    </div>
  );
};
