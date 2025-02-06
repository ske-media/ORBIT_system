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
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Océane',
    email: 'oceane@orbit.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7dc94eb4-3be4-4c0e-a1e0-402b1e6bd883',
    name: 'SKE',
    email: 'ske@orbit.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];