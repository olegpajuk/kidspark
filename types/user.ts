export interface ParentUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: ParentUser | null;
  loading: boolean;
  error: string | null;
}
