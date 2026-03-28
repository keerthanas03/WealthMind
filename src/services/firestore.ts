import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Asset, Goal, UserProfile } from '../types';

export const portfolioService = {
  async getPortfolio(userId: string): Promise<Asset[]> {
    const q = query(collection(db, 'portfolios'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Asset);
  },
  async addAsset(userId: string, asset: Asset) {
    return addDoc(collection(db, 'portfolios'), { ...asset, userId });
  }
};

export const goalService = {
  async getGoals(userId: string): Promise<Goal[]> {
    const q = query(collection(db, 'goals'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Goal);
  }
};

export const userService = {
  async updateProfile(userId: string, profile: Partial<UserProfile>) {
    const userDoc = doc(db, 'users', userId);
    return updateDoc(userDoc, profile);
  }
};
