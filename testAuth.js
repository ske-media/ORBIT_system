import { createClient } from '@supabase/supabase-js';

// Remplace par tes propres clés
const SUPABASE_URL = 'https://szcbjczawqwpzuaiejzv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6Y2JqY3phd3F3cHp1YWllanp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1ODc4NDYsImV4cCI6MjA1MzE2Mzg0Nn0.edOK5q_J4ZNHMtk_D3Al63zv4oU6wsP6jBC-8nwmc-U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
    const { data, error } = await supabase.auth.signUp({
        email: 'test@agence-orbit.ch',
        password: 'Test1234'
    });

    if (error) {
        console.error('Signup Error:', error);
    } else {
        console.log('User signed up:', data);
    }
}

async function testLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@agence-orbit.ch',
        password: 'Test1234'
    });

    if (error) {
        console.error('Login Error:', error);
    } else {
        console.log('User logged in:', data);
    }
}

// Exécuter les tests
testSignup().then(() => testLogin());