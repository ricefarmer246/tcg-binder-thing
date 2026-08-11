import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBinder, deleteBinder, listMyBinders } from '../lib/binders';
import type { Binder } from '../lib/types';
import { friendlyError } from '../lib/errors';

export function Dashboard() {
  const { user } = useAuth();
  const [binders, setBinders] = useState<Binder[] | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listMyBinders(user.$id)
      .then(setBinders)
      .catch((err) => setError(friendlyError(err, "Couldn't load your binders.")));
  }, [user]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const binder = await createBinder(user.$id, newName.trim());
      setBinders((prev) => [binder, ...(prev ?? [])]);
      setNewName('');
    } catch (err) {
      setError(friendlyError(err, "Couldn't create that binder."));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(binder: Binder) {
    if (!confirm(`Delete "${binder.name}"? This removes every card inside it too. This can't be undone.`)) {
      return;
    }
    setDeletingId(binder.$id);
    setError(null);
    try {
      await deleteBinder(binder.$id);
      setBinders((prev) => (prev ?? []).filter((b) => b.$id !== binder.$id));
    } catch (err) {
      setError(friendlyError(err, "Couldn't delete that binder."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My Binders</h1>
      <p className="mt-1 text-sm text-slate-500">Create a binder, then add cards to it.</p>

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Binder name, e.g. Base Set Holos"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'New binder'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8">
        {binders === null ? (
          <p className="text-sm text-slate-500">Loading your binders...</p>
        ) : binders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-500">
            <p className="text-3xl">🗂️</p>
            <p className="mt-2">You don't have any binders yet. Make your first one above!</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {binders.map((binder) => (
              <li
                key={binder.$id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md"
              >
                <Link to={`/binders/${binder.$id}`} className="block">
                  <div className="text-2xl">🗂️</div>
                  <h2 className="mt-2 font-semibold text-slate-900">{binder.name}</h2>
                </Link>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDelete(binder)}
                    disabled={deletingId === binder.$id}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === binder.$id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
