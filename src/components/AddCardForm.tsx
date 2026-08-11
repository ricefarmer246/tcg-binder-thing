import { useRef, useState, type FormEvent } from 'react';
import { friendlyError } from '../lib/errors';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function AddCardForm({
  onAdd,
}: {
  onAdd: (name: string, file: File) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setError(null);

    if (selected && selected.size > MAX_FILE_BYTES) {
      setError('That picture is too big. Please choose one under 5MB.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Give the card a name first.');
      return;
    }
    if (!file) {
      setError('Add a picture of the card before saving.');
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(name.trim(), file);
      setName('');
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(friendlyError(err, "Couldn't add that card. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
        Card name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Charizard"
          className="rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Picture
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-slate-200"
        />
      </label>

      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="h-16 w-12 rounded-md border border-slate-200 object-cover" />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add card'}
      </button>

      {error && (
        <p role="alert" className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:w-auto">
          {error}
        </p>
      )}
    </form>
  );
}
