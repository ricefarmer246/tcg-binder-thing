import { useState } from 'react';
import type { CardItem } from '../lib/types';
import { cardImageUrl } from '../lib/cards';

export function CardTile({ card, onDelete }: { card: CardItem; onDelete?: () => Promise<void> }) {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm(`Remove "${card.name}" from this binder?`)) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      // If the card is still here (delete failed), let the user try again.
      setDeleting(false);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex aspect-[5/7] items-center justify-center bg-slate-50">
        {imgError ? (
          <div className="flex flex-col items-center gap-1 px-2 text-center text-xs text-slate-400">
            <span className="text-xl">🖼️</span>
            Image unavailable
          </div>
        ) : (
          <img
            src={cardImageUrl(card.imageFileId)}
            alt={card.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="border-t border-slate-100 px-2 py-1.5">
        <p className="truncate text-sm font-medium text-slate-800" title={card.name}>
          {card.name}
        </p>
      </div>

      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Remove ${card.name}`}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white disabled:opacity-50"
        >
          ✕
        </button>
      )}
    </div>
  );
}
