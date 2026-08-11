import type { Models } from 'appwrite';

export interface Binder extends Models.Document {
  name: string;
  ownerId: string;
}

export interface CardItem extends Models.Document {
  binderId: string;
  ownerId: string;
  name: string;
  imageFileId: string;
}
