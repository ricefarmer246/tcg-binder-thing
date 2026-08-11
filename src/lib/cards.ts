import { databases, storage, DATABASE_ID, CARDS_COLLECTION_ID, BUCKET_ID, ID, Permission, Query, Role } from './appwrite';
import type { CardItem } from './types';

export async function listCardsForBinder(binderId: string): Promise<CardItem[]> {
  const res = await databases.listDocuments<CardItem>({
    databaseId: DATABASE_ID,
    collectionId: CARDS_COLLECTION_ID,
    queries: [Query.equal('binderId', binderId), Query.orderAsc('$createdAt'), Query.limit(500)],
  });
  return res.documents;
}

export async function addCard(
  binderId: string,
  userId: string,
  name: string,
  imageFile: File,
): Promise<CardItem> {
  const uploaded = await storage.createFile({
    bucketId: BUCKET_ID,
    fileId: ID.unique(),
    file: imageFile,
    permissions: [Permission.read(Role.any()), Permission.delete(Role.user(userId))],
  });

  try {
    return await databases.createDocument<CardItem>({
      databaseId: DATABASE_ID,
      collectionId: CARDS_COLLECTION_ID,
      documentId: ID.unique(),
      data: { binderId, ownerId: userId, name, imageFileId: uploaded.$id },
      permissions: [
        Permission.read(Role.any()),
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    });
  } catch (err) {
    // Don't leave an orphaned image behind if the card record fails to save.
    await storage.deleteFile({ bucketId: BUCKET_ID, fileId: uploaded.$id }).catch(() => {});
    throw err;
  }
}

export async function deleteCard(card: CardItem): Promise<void> {
  await databases.deleteDocument({
    databaseId: DATABASE_ID,
    collectionId: CARDS_COLLECTION_ID,
    documentId: card.$id,
  });
  await storage.deleteFile({ bucketId: BUCKET_ID, fileId: card.imageFileId }).catch(() => {});
}

export async function deleteAllCardsForBinder(binderId: string): Promise<void> {
  const cards = await listCardsForBinder(binderId);
  await Promise.all(cards.map((card) => deleteCard(card)));
}

export function cardImageUrl(imageFileId: string): string {
  return storage.getFileView({ bucketId: BUCKET_ID, fileId: imageFileId });
}
