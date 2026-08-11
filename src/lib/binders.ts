import { databases, DATABASE_ID, BINDERS_COLLECTION_ID, ID, Permission, Query, Role } from './appwrite';
import type { Binder } from './types';
import { deleteAllCardsForBinder } from './cards';

export async function listMyBinders(userId: string): Promise<Binder[]> {
  const res = await databases.listDocuments<Binder>({
    databaseId: DATABASE_ID,
    collectionId: BINDERS_COLLECTION_ID,
    queries: [Query.equal('ownerId', userId), Query.orderDesc('$createdAt')],
  });
  return res.documents;
}

export async function getBinder(binderId: string): Promise<Binder> {
  return databases.getDocument<Binder>({
    databaseId: DATABASE_ID,
    collectionId: BINDERS_COLLECTION_ID,
    documentId: binderId,
  });
}

export async function createBinder(userId: string, name: string): Promise<Binder> {
  return databases.createDocument<Binder>({
    databaseId: DATABASE_ID,
    collectionId: BINDERS_COLLECTION_ID,
    documentId: ID.unique(),
    data: { name, ownerId: userId },
    permissions: [
      Permission.read(Role.any()),
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
}

export async function renameBinder(binderId: string, name: string): Promise<Binder> {
  return databases.updateDocument<Binder>({
    databaseId: DATABASE_ID,
    collectionId: BINDERS_COLLECTION_ID,
    documentId: binderId,
    data: { name },
  });
}

export async function deleteBinder(binderId: string): Promise<void> {
  await deleteAllCardsForBinder(binderId);
  await databases.deleteDocument({
    databaseId: DATABASE_ID,
    collectionId: BINDERS_COLLECTION_ID,
    documentId: binderId,
  });
}
