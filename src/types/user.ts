export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Get users from Supabase auth
export async function getUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  
  return users.map(user => ({
    id: user.id,
    name: user.email?.split('@')[0] || 'Unknown',
    email: user.email || '',
    role: (user.user_metadata?.role as 'admin' | 'user') || 'user',
    createdAt: user.created_at,
    updatedAt: user.last_sign_in_at || user.created_at
  }));
}