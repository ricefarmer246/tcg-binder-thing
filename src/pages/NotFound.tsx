import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex-1 py-24 text-center">
      <p className="text-4xl">🔍</p>
      <p className="mt-3 text-slate-600">We couldn't find that page.</p>
      <Link to="/" className="mt-3 inline-block text-indigo-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}
