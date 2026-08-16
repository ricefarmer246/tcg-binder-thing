import { isAppwriteConfigured } from '../lib/appwrite';
import { useLocation } from 'react-router-dom';

export function ConfigWarning() {
  const { pathname } = useLocation();
  if (isAppwriteConfigured || pathname === '/guest') return null;

  return (
    <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
      Appwrite isn't configured yet. Run <code className="rounded bg-amber-100 px-1">npm run setup:appwrite</code>{' '}
      or fill in <code className="rounded bg-amber-100 px-1">.env</code> — see the README.
    </div>
  );
}
