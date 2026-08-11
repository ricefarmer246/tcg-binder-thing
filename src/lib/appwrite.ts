import { Account, Client, Databases, Storage } from 'appwrite';

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT as string;
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
export const BINDERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_BINDERS_COLLECTION_ID as string;
export const CARDS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CARDS_COLLECTION_ID as string;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID as string;

export const isAppwriteConfigured = Boolean(
  APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID && DATABASE_ID && BINDERS_COLLECTION_ID && CARDS_COLLECTION_ID && BUCKET_ID,
);

const client = new Client();

if (isAppwriteConfigured) {
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Permission, Query, Role } from 'appwrite';
