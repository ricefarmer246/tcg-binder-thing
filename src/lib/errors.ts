export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const message = err instanceof Error ? err.message : String(err);

  if (/already exists|user_already_exists/i.test(message)) {
    return 'An account with that email already exists. Try logging in instead.';
  }
  if (/invalid credentials/i.test(message)) {
    return "That email or password doesn't match our records.";
  }
  if (/password.*(least|length|8)/i.test(message)) {
    return 'Passwords need to be at least 8 characters.';
  }
  if (/invalid.*email|email.*invalid/i.test(message)) {
    return "That doesn't look like a valid email address.";
  }
  if (/rate limit/i.test(message)) {
    return "You've tried this too many times. Wait a minute and try again.";
  }
  if (/network|failed to fetch/i.test(message)) {
    return "Couldn't reach the server. Check your internet connection and try again.";
  }
  return message || fallback;
}
