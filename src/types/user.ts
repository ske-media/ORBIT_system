export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Temporary mock users for development
export const MOCK_USERS: User[] = [
  {
    id: 'steven@agence-orbit.ch',
    name: 'Steven',
    email: 'steven@agence-orbit.ch',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'oceane@agence-orbit.ch',
    name: 'Océane',
    email: 'oceane@agence-orbit.ch',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];