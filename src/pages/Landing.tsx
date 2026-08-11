import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/binders" replace />;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Your card collection, in a tidy online binder.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        Add your cards with a name and a picture, arrange them in a binder, and share a link so friends
        can see your collection — no app, no login needed on their end.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          to="/signup"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Sign up free
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Log in
        </Link>
      </div>

      <div className="mt-16 grid w-full grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-[5/7] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-2xl"
          >
            {['🔥', '💧', '🌿', '⚡', '✨', '🌙'][i % 6]}
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-8 text-left sm:grid-cols-3">
        <div>
          <div className="text-2xl">📸</div>
          <h2 className="mt-2 font-semibold text-slate-900">Add cards fast</h2>
          <p className="mt-1 text-sm text-slate-500">
            A name and a picture is all it takes to add a card to your binder.
          </p>
        </div>
        <div>
          <div className="text-2xl">🗂️</div>
          <h2 className="mt-2 font-semibold text-slate-900">Stays organized</h2>
          <p className="mt-1 text-sm text-slate-500">
            Every binder is laid out in a clean grid so you can actually see what you have.
          </p>
        </div>
        <div>
          <div className="text-2xl">🔗</div>
          <h2 className="mt-2 font-semibold text-slate-900">Share with a link</h2>
          <p className="mt-1 text-sm text-slate-500">
            Copy your binder's link and send it to anyone — they can look, but only you can edit.
          </p>
        </div>
      </div>
    </div>
  );
}
