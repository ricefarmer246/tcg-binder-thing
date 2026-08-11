import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBinder, renameBinder } from '../lib/binders';
import { addCard, deleteCard, listCardsForBinder } from '../lib/cards';
import type { Binder, CardItem } from '../lib/types';
import { friendlyError } from '../lib/errors';
import { AddCardForm } from '../components/AddCardForm';
import { CardTile } from '../components/CardTile';
import { ShareLinkButton } from '../components/ShareLinkButton';

type LoadState = 'loading' | 'ready' | 'not-found' | 'not-yours';

export function BinderView() {
  const { binderId } = useParams<{ binderId: string }>();
  const { user } = useAuth();
  const [state, setState] = useState<LoadState>('loading');
  const [binder, setBinder] = useState<Binder | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    if (!binderId || !user) return;
    let cancelled = false;

    (async () => {
      try {
        const [foundBinder, foundCards] = await Promise.all([
          getBinder(binderId),
          listCardsForBinder(binderId),
        ]);
        if (cancelled) return;
        if (foundBinder.ownerId !== user.$id) {
          setState('not-yours');
          return;
        }
        setBinder(foundBinder);
        setNameDraft(foundBinder.name);
        setCards(foundCards);
        setState('ready');
      } catch {
        if (!cancelled) setState('not-found');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [binderId, user]);

  async function handleAddCard(name: string, file: File) {
    if (!binder || !user) return;
    const card = await addCard(binder.$id, user.$id, name, file);
    setCards((prev) => [...prev, card]);
  }

  async function handleDeleteCard(card: CardItem) {
    setError(null);
    try {
      await deleteCard(card);
      setCards((prev) => prev.filter((c) => c.$id !== card.$id));
    } catch (err) {
      setError(friendlyError(err, "Couldn't remove that card."));
    }
  }

  async function handleSaveName() {
    if (!binder || !nameDraft.trim()) return;
    try {
      const updated = await renameBinder(binder.$id, nameDraft.trim());
      setBinder(updated);
      setRenaming(false);
    } catch (err) {
      setError(friendlyError(err, "Couldn't rename that binder."));
    }
  }

  if (state === 'loading') {
    return <p className="flex-1 py-24 text-center text-slate-500">Loading your binder...</p>;
  }

  if (state === 'not-found') {
    return (
      <div className="flex-1 py-24 text-center">
        <p className="text-slate-600">We couldn't find that binder.</p>
        <Link to="/binders" className="mt-3 inline-block text-indigo-600 hover:underline">
          Back to My Binders
        </Link>
      </div>
    );
  }

  if (state === 'not-yours') {
    return (
      <div className="flex-1 py-24 text-center">
        <p className="text-slate-600">This binder belongs to someone else, so you can't edit it here.</p>
        <Link to="/binders" className="mt-3 inline-block text-indigo-600 hover:underline">
          Back to My Binders
        </Link>
      </div>
    );
  }

  if (!binder) return null;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Link to="/binders" className="text-sm text-slate-500 hover:text-slate-700">
        ← My Binders
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        {renaming ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xl font-bold focus:border-indigo-500 focus:outline-none"
            />
            <button onClick={handleSaveName} className="text-sm font-medium text-indigo-600 hover:underline">
              Save
            </button>
            <button
              onClick={() => {
                setRenaming(false);
                setNameDraft(binder.name);
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            {binder.name}
            <button
              onClick={() => setRenaming(true)}
              aria-label="Rename binder"
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              ✏️
            </button>
          </h1>
        )}

        <ShareLinkButton binderId={binder.$id} />
      </div>

      <p className="mt-1 text-sm text-slate-500">
        Anyone with the share link can view this binder. Only you can add or remove cards.
      </p>

      <div className="mt-6">
        <AddCardForm onAdd={handleAddCard} />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8">
        {cards.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-500">
            <p className="text-3xl">📸</p>
            <p className="mt-2">No cards yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {cards.map((card) => (
              <CardTile key={card.$id} card={card} onDelete={() => handleDeleteCard(card)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
