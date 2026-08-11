import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Nav() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogOut() {
    await logOut();
    navigate('/');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span aria-hidden="true">🗂️</span>
          MyStuffsBetter
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/binders" className="text-slate-600 hover:text-slate-900">
                My Binders
              </Link>
              <span className="hidden text-slate-400 sm:inline">{user.name}</span>
              <button
                onClick={handleLogOut}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
