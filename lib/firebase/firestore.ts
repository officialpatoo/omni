
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile } from '@/types';

const PROFILES_COLLECTION = 'profiles';

export async function saveProfile(userId: string, profileData: UserProfile): Promise<void> {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  await setDoc(profileRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  const profileSnap = await getDoc(profileRef);

  if (profileSnap.exists()) {
    return profileSnap.data() as UserProfile;
  } else {
    return null;
  }
}

    