# MyStuffsBetter

A virtual card binder. Sign up, build a binder, add cards with a name and a picture, and share a link
so anyone can look through your binder — no account needed on their end.

Built with React + Vite, and [Appwrite](https://appwrite.io) for accounts, the database, and image storage.

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create an Appwrite project.** Use [Appwrite Cloud](https://cloud.appwrite.io) (free) or your own
   self-hosted instance. In the project, go to **Auth > Settings** and make sure **Email/Password**
   is enabled (it is by default).

3. **Create an API key.** In your project, go to **Overview > Integrate with your server** (or
   **Project Settings > API Keys**) and create a key with these scopes: `databases.write`,
   `collections.write`, `attributes.write`, `indexes.write`, `documents.write`, `buckets.write`,
   `files.write`.

4. **Set up your environment file**

   ```bash
   cp .env.example .env
   ```

   Fill in `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, and `APPWRITE_API_KEY` (all found in your
   Appwrite project settings).

5. **Provision the database automatically**

   ```bash
   npm run setup:appwrite
   ```

   This creates the database, the `binders` and `cards` collections (with the right attributes,
   indexes, and permissions), a storage bucket for card images, and a `localhost` Web platform entry
   (so your dev server is allowed to call the API) — then writes all the resulting IDs into `.env`
   for you. Safe to re-run; it skips anything that already exists.

6. **Run the app**

   ```bash
   npm run dev
   ```

## How data is modeled in Appwrite

- **`binders` collection** — one document per binder: `name`, `ownerId`. Every binder document is
  created with `read(any)` so its share link works for signed-out visitors, plus
  `read/update/delete(user:<ownerId>)` so only the owner can edit or remove it.
- **`cards` collection** — one document per card: `binderId`, `ownerId`, `name`, `imageFileId`.
  Same permission shape as binders: publicly readable, owner-only writable.
- **`binder-images` storage bucket** — the actual card pictures. Each file is uploaded with
  `read(any)` (so shared binders can display images) and `delete(user:<ownerId>)`.

Because permissions are enforced by Appwrite itself (not just hidden in the UI), a signed-in user
can never edit or delete another person's binder or cards, even by calling the API directly.

## Project structure

```
src/
  lib/appwrite.ts       Appwrite client setup (reads .env)
  lib/binders.ts         Binder CRUD
  lib/cards.ts            Card CRUD + image upload/URLs
  context/AuthContext.tsx Sign up / log in / log out, current user
  components/              Reusable UI (nav, card tile, add-card form, share button)
  pages/                   Landing, Login, Signup, Dashboard, BinderView, PublicBinder
scripts/setup-appwrite.mjs Provisions Appwrite (run via `npm run setup:appwrite`)
```

## Deploying

Build a static bundle with `npm run build` (outputs to `dist/`) and host it anywhere that serves
static files (Vercel, Netlify, Cloudflare Pages, etc). Remember to add that production hostname as
a Web platform in Appwrite too, and set the same `VITE_APPWRITE_*` environment variables on your
host.
