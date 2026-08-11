import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBinder } from '../lib/binders';
import { listCardsForBinder } from '../lib/cards';
import type { Binder, CardItem } from '../lib/types';
import { CardTile } from '../components/CardTile';

type LoadState = 'loading' | 'ready' | 'not-found';

export function PublicBinder() {
  const { binderId } = useParams<{ binderId: string }>();
  const [state, setState] = useState<LoadState>('loading');
  const [binder, setBinder] = useState<Binder | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);

  useEffect(() => {
    if (!binderId) return;
    let cancelled = false;

    (async () => {
      try {
        const [foundBinder, foundCards] = await Promise.all([
          getBinder(binderId),
          listCardsForBinder(binderId),
        ]);
        if (cancelled) return;
        setBinder(foundBinder);
        setCards(foundCards);
        setState('ready');
      } catch {
        if (!cancelled) setState('not-found');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [binderId]);

  if (state === 'loading') {
    return <p className="flex-1 py-24 text-center text-slate-500">Loading binder...</p>;
  }

  if (state === 'not-found' || !binder) {
    return (
      <div className="flex-1 py-24 text-center">
        <p className="text-slate-600">This binder doesn't exist, or the link isn't valid anymore.</p>
        <Link to="/" className="mt-3 inline-block text-indigo-600 hover:underline">
          Go to MyStuffsBetter
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Shared binder · view only</p>
          <h1 className="text-2xl font-bold text-slate-900">{binder.name}</h1>
        </div>
        <Link
          to="/signup"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Make your own binder
        </Link>
      </div>

      <div className="mt-8">
        {cards.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-500">
            <p className="text-3xl">📭</p>
            <p className="mt-2">This binder doesn't have any cards yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {cards.map((card) => (
              <CardTile key={card.$id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
