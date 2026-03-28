export interface Asset {
  id?: string;
  name: string;
  tickerSymbol: string;
  type: string;
  invested: number;
  current: number;
  quantity?: number;
  pricePerUnit?: number;
  purchaseDate: string;
}

export interface Goal {
  id?: string; // Supabase row ID for delete/update
  name: string;
  target: number;
  year: number;
  progress: number;
  icon: any;
  color: string;
}

export interface Message {
  role: 'user' | 'ai';
  text: string;
  why?: string;
  takeaway?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface PortfolioHistory {
  id?: string;
  total_value: number;
  created_at: string;
}
