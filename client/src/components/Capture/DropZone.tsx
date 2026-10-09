import React, { useState } from 'react';

import { Icon } from '../common/Icon';
import { BUTTON_SECONDARY } from '../common/styles';

interface DropZoneProps {
  /** Receives the Choose files button, so focus can return to it. */
  buttonRef: React.Ref<HTMLButtonElement>;
  /** Opens the file picker. */
  onBrowse: () => void;
  /** Receives the files dropped on the zone; one that isn't an image fails in its row, as a picked one does. */
  onFiles: (files: File[]) => void;
  /** True once the bill is at its receipt cap; drops and the picker are both off. */
  isDisabled: boolean;
}

/**
 * The capture screen's upload frame: drop receipt images on it, or tap anywhere on it to choose them.
 * @param props - The button ref, the picker and drop handlers, and whether the bill is full
 * @returns The drop zone
 */
export const DropZone: React.FC<DropZoneProps> = ({ buttonRef, onBrowse, onFiles, isDisabled }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = isDisabled ? 'none' : 'copy';
    setIsOver(!isDisabled);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Moving onto a child also fires dragleave; only a pointer leaving the zone ends the highlight.
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    if (isDisabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFiles(files);
  };

  return (
    // The whole frame opens the picker (phones can't drop); the button is its keyboard stop, and its click
    // bubbles here.
    <div
      onClick={isDisabled ? undefined : onBrowse}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-wrap items-center gap-4 rounded-xl border border-dashed px-5 py-[18px] transition-colors duration-200 ${
        isDisabled ? '' : 'cursor-pointer'
      } ${
        isOver ? 'border-settled bg-settled-wash/40' : `border-line-strong bg-surface ${isDisabled ? '' : 'hover:border-ink-4'}`
      }`}
    >
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-settled-wash text-settled">
        <Icon name="upload" size={20} />
      </span>
      <div className="min-w-0 flex-[1_1_180px]">
        <div className="text-[15px] font-medium tracking-[-0.01em]">Add receipt photos</div>
        <div className="text-[13px] text-ink-3">Photos or screenshots, several at once</div>
      </div>
      <button
        ref={buttonRef}
        type="button"
        aria-disabled={isDisabled}
        className={`h-10 px-4 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-40 ${BUTTON_SECONDARY}`}
      >
        Choose files
      </button>
    </div>
  );
};
