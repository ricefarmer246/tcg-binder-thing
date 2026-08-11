import { useState } from 'react';

export function ShareLinkButton({ binderId }: { binderId: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${binderId}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (older browsers, permissions) — fall back to a manual prompt.
      window.prompt('Copy this link:', shareUrl);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      title={shareUrl}
    >
      <span aria-hidden="true">🔗</span>
      {copied ? 'Link copied!' : 'Copy share link'}
    </button>
  );
}
