// services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import 'react-native-get-random-values';

const SUPABASE_URL = 'https://YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------- USER TYPE -----------------
export interface UserType {
  id: string;
  email: string;
  full_name: string;
  role: string;
  password?: string; // optional, only for internal use
}

// ----------------- SIGN UP -----------------
export async function emailSignUp(
  email: string,
  password: string,
  fullName: string,
  role: string
): Promise<UserType> {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        email,
        password: hashedPassword,
        full_name: fullName,
        role,
      })
      .select()
      .single();

    if (error) throw error;

    // Save user in AsyncStorage
    await AsyncStorage.setItem('currentUser', JSON.stringify(data));

    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log('Sign up error:', err.message);
      throw new Error(err.message);
    } else {
      console.log('Sign up unknown error:', err);
      throw new Error('An unknown error occurred');
    }
  }
}

// ----------------- SIGN IN -----------------
export async function emailSignIn(email: string, password: string): Promise<UserType> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    if (!data) throw new Error('User not found');

    const isValid = bcrypt.compareSync(password, data.password);
    if (!isValid) throw new Error('Invalid password');

    // Save user in AsyncStorage
    await AsyncStorage.setItem('currentUser', JSON.stringify(data));

    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log('Sign in error:', err.message);
      throw new Error(err.message);
    } else {
      console.log('Sign in unknown error:', err);
      throw new Error('An unknown error occurred');
    }
  }
}

// ----------------- GET CURRENT USER -----------------
export async function getCurrentUser(): Promise<UserType | null> {
  try {
    const user = await AsyncStorage.getItem('currentUser');
    return user ? (JSON.parse(user) as UserType) : null;
  } catch (err: unknown) {
    console.log('Get current user error:', err);
    return null;
  }
}

// ----------------- LOGOUT -----------------
export async function logout() {
  try {
    await AsyncStorage.removeItem('currentUser');
    console.log('User logged out');
  } catch (err: unknown) {
    console.log('Logout error:', err);
  }
}
