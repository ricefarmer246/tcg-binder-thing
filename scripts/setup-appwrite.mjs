// One-time setup script: creates the Appwrite database, collections, attributes,
// indexes, and storage bucket that MyStuffsBetter needs, then writes the
// generated IDs back into your .env file.
//
// Run with: npm run setup:appwrite
// Requires APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY in .env
// (see .env.example for the API key scopes it needs).

import { Client, Databases, Storage, Project, Permission, Role, ID } from 'node-appwrite';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

config();

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error(
    'Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY.\n' +
      'Copy .env.example to .env and fill those three in first.',
  );
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);
const project = new Project(client);

const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'mystuffsbetter';
const BINDERS_COLLECTION_ID = 'binders';
const CARDS_COLLECTION_ID = 'cards';
const BUCKET_ID = 'binder-images';

// Appwrite returns 409 if something already exists — treat that as "already done".
async function ignoreConflict(promise, label) {
  try {
    await promise;
    console.log(`  created: ${label}`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`  already exists, skipping: ${label}`);
    } else {
      throw err;
    }
  }
}

// For top-level resources (database/collection/bucket), a plan's quota can reject
// a duplicate "create" before Appwrite even checks for a 409, so check first instead.
async function ensureExists(getPromiseFactory, createPromiseFactory, label) {
  try {
    await getPromiseFactory();
    console.log(`  already exists, skipping: ${label}`);
  } catch (err) {
    if (err.code === 404) {
      await createPromiseFactory();
      console.log(`  created: ${label}`);
    } else {
      throw err;
    }
  }
}

async function waitForAttribute(collectionId, key) {
  for (let i = 0; i < 30; i++) {
    const attr = await databases.getAttribute(DATABASE_ID, collectionId, key);
    if (attr.status === 'available') return;
    if (attr.status === 'failed') throw new Error(`Attribute ${key} on ${collectionId} failed to build`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timed out waiting for attribute ${key} on ${collectionId}`);
}

async function main() {
  console.log(`Setting up Appwrite project ${PROJECT_ID} at ${ENDPOINT}\n`);

  console.log('Database:');
  await ensureExists(
    () => databases.get(DATABASE_ID),
    () => databases.create(DATABASE_ID, 'MyStuffsBetter'),
    DATABASE_ID,
  );

  console.log('\nBinders collection:');
  await ensureExists(
    () => databases.getCollection(DATABASE_ID, BINDERS_COLLECTION_ID),
    () =>
      databases.createCollection(DATABASE_ID, BINDERS_COLLECTION_ID, 'Binders', [
        Permission.create(Role.users()),
      ], true),
    BINDERS_COLLECTION_ID,
  );
  await ignoreConflict(
    databases.createStringAttribute(DATABASE_ID, BINDERS_COLLECTION_ID, 'name', 100, true),
    'binders.name',
  );
  await ignoreConflict(
    databases.createStringAttribute(DATABASE_ID, BINDERS_COLLECTION_ID, 'ownerId', 64, true),
    'binders.ownerId',
  );
  await waitForAttribute(BINDERS_COLLECTION_ID, 'name');
  await waitForAttribute(BINDERS_COLLECTION_ID, 'ownerId');
  await ignoreConflict(
    databases.createIndex(DATABASE_ID, BINDERS_COLLECTION_ID, 'ownerId_idx', 'key', ['ownerId']),
    'binders.ownerId_idx',
  );

  console.log('\nCards collection:');
  await ensureExists(
    () => databases.getCollection(DATABASE_ID, CARDS_COLLECTION_ID),
    () =>
      databases.createCollection(DATABASE_ID, CARDS_COLLECTION_ID, 'Cards', [
        Permission.create(Role.users()),
      ], true),
    CARDS_COLLECTION_ID,
  );
  await ignoreConflict(
    databases.createStringAttribute(DATABASE_ID, CARDS_COLLECTION_ID, 'binderId', 64, true),
    'cards.binderId',
  );
  await ignoreConflict(
    databases.createStringAttribute(DATABASE_ID, CARDS_COLLECTION_ID, 'ownerId', 64, true),
    'cards.ownerId',
  );
  await ignoreConflict(
    databases.createStringAttribute(DATABASE_ID, CARDS_COLLECTION_ID, 'name', 200, true),
    'cards.name',
  );
  await ignoreConflict(
    databases.createStringAttribute(DATABASE_ID, CARDS_COLLECTION_ID, 'imageFileId', 64, true),
    'cards.imageFileId',
  );
  await waitForAttribute(CARDS_COLLECTION_ID, 'binderId');
  await waitForAttribute(CARDS_COLLECTION_ID, 'ownerId');
  await waitForAttribute(CARDS_COLLECTION_ID, 'name');
  await waitForAttribute(CARDS_COLLECTION_ID, 'imageFileId');
  await ignoreConflict(
    databases.createIndex(DATABASE_ID, CARDS_COLLECTION_ID, 'binderId_idx', 'key', ['binderId']),
    'cards.binderId_idx',
  );
  await ignoreConflict(
    databases.createIndex(DATABASE_ID, CARDS_COLLECTION_ID, 'ownerId_idx', 'key', ['ownerId']),
    'cards.ownerId_idx',
  );

  console.log('\nStorage bucket:');
  await ensureExists(
    () => storage.getBucket(BUCKET_ID),
    () =>
      storage.createBucket(
        BUCKET_ID,
        'Binder Images',
        [Permission.create(Role.users())],
        true, // fileSecurity — per-file permissions
        true, // enabled
        5 * 1024 * 1024, // 5MB max
        ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      ),
    BUCKET_ID,
  );

  console.log('\nWeb platform (so your browser is allowed to call the API):');
  const existingPlatforms = await project.listPlatforms();
  if (existingPlatforms.platforms.some((p) => p.hostname === 'localhost')) {
    console.log('  already exists, skipping: localhost');
  } else {
    await project.createWebPlatform({ platformId: ID.unique(), name: 'localhost dev', hostname: 'localhost' });
    console.log('  created: localhost');
  }

  console.log('\nAll done. Writing IDs into .env ...');
  updateEnvFile({
    VITE_APPWRITE_ENDPOINT: ENDPOINT,
    VITE_APPWRITE_PROJECT_ID: PROJECT_ID,
    VITE_APPWRITE_DATABASE_ID: DATABASE_ID,
    VITE_APPWRITE_BINDERS_COLLECTION_ID: BINDERS_COLLECTION_ID,
    VITE_APPWRITE_CARDS_COLLECTION_ID: CARDS_COLLECTION_ID,
    VITE_APPWRITE_BUCKET_ID: BUCKET_ID,
  });

  console.log('\nDone! Your .env is ready. In the Appwrite console, also make sure to:');
  console.log('  1. Add a Web platform (Project Settings > Platforms) with your dev/prod hostnames.');
  console.log('  2. Confirm Email/Password auth is enabled (Auth > Settings).');
  console.log('\nThen run: npm run dev');
}

function updateEnvFile(values) {
  const envPath = new URL('../.env', import.meta.url);
  let lines = existsSync(envPath) ? readFileSync(envPath, 'utf8').split('\n') : [];

  for (const [key, value] of Object.entries(values)) {
    const lineIndex = lines.findIndex((l) => l.startsWith(`${key}=`));
    const newLine = `${key}=${value}`;
    if (lineIndex >= 0) {
      lines[lineIndex] = newLine;
    } else {
      lines.push(newLine);
    }
  }

  writeFileSync(envPath, lines.join('\n'));
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message || err);
  process.exit(1);
});
