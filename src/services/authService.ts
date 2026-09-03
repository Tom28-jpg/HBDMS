import { User } from '../types';
import { storageService } from './storageService';
import { getSupabaseClient, isSupabaseConfigured, MODULE_TABLE_MAP } from '../lib/supabase';

const USERS_STORAGE_KEY = 'hbdms_registered_users_v1';
const SESSION_STORAGE_KEY = 'hbdms_active_session_v1';

// Seed demo biomedical engineer
const DEFAULT_USERS: User[] = [
  {
    id: 'usr-demo-1',
    name: 'Alex Morgan',
    designation: 'Senior Biomedical Engineer',
    mobileNumber: '9845012345',
    email: 'bme.alex@hospital.org',
    hospitalName: 'Apollo Memorial Multi-Speciality Hospital',
    passwordHash: 'Demo@2026', // Stored password representation
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-demo-2',
    name: 'Sarah Chen',
    designation: 'Assistant Biomedical Engineer',
    mobileNumber: '9876543210',
    email: 'bme.sarah@hospital.org',
    hospitalName: 'Apollo Memorial Multi-Speciality Hospital',
    passwordHash: 'Demo@2026',
    createdAt: '2026-02-15T09:30:00Z',
  },
];

class AuthService {
  private users: User[];
  private currentUser: User | null = null;
  private authListeners: Array<(user: User | null) => void> = [];

  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadSession();
  }

  private loadUsers(): User[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading users', e);
    }
    this.saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  private saveUsers(users: User[]) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users', e);
    }
  }

  private loadSession(): User | null {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch (e) {
      console.error('Error loading session', e);
    }
    // No auto-login — always show the login page for new visitors
    return null;
  }

  private saveSession(user: User | null) {
    try {
      if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving session', e);
    }
    this.currentUser = user;
    storageService.switchUser(user);
    this.notify();
  }

  public subscribe(listener: (user: User | null) => void) {
    this.authListeners.push(listener);
    return () => {
      this.authListeners = this.authListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.authListeners.forEach((listener) => listener(this.currentUser));
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public register(data: {
    name: string;
    designation: string;
    mobileNumber: string;
    email: string;
    hospitalName: string;
    password: string;
  }): { success: boolean; error?: string; user?: User } {
    // Validations
    if (!data.name.trim()) return { success: false, error: 'Name is required' };
    if (!data.designation.trim()) return { success: false, error: 'Designation is required' };
    if (!data.hospitalName.trim()) return { success: false, error: 'Hospital Name is required' };

    // Mobile validation: 10 digits
    const cleanMobile = data.mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Password validation: min 6 chars
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    // Check duplicate email
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      designation: data.designation.trim(),
      mobileNumber: cleanMobile,
      email: data.email.trim().toLowerCase(),
      hospitalName: data.hospitalName.trim(),
      passwordHash: data.password,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveUsers(this.users);
    this.saveSession(newUser);

    // Persist to Supabase
    this.saveUserToSupabase(newUser);

    return { success: true, user: newUser };
  }

  private async saveUserToSupabase(user: User): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('registered_users').upsert({
        id: user.id,
        name: user.name,
        designation: user.designation,
        mobile_number: user.mobileNumber,
        email: user.email,
        hospital_name: user.hospitalName,
        password_hash: user.passwordHash,
        created_at: user.createdAt,
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed to save user to Supabase:', err);
    }
  }

  public login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'No account found with this email address' };
    }

    if (user.passwordHash !== password) {
      return { success: false, error: 'Invalid password. Please check and try again.' };
    }

    this.saveSession(user);
    return { success: true, user };
  }

  public logout() {
    this.saveSession(null);
  }

  public updateProfile(updates: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>): boolean {
    if (!this.currentUser) return false;
    const idx = this.users.findIndex((u) => u.id === this.currentUser!.id);
    if (idx === -1) return false;

    this.users[idx] = {
      ...this.users[idx],
      ...updates,
    };
    this.currentUser = this.users[idx];
    this.saveUsers(this.users);
    this.saveSession(this.currentUser);
    return true;
  }

  private async deleteUserFromSupabase(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;
    try {
      // 1. Delete main account
      await client.from('registered_users').delete().eq('id', userId);

      // 2. Cascade delete all modules pushed by this user
      const tables = Object.values(MODULE_TABLE_MAP);
      for (const table of tables) {
        await client.from(table).delete().eq('user_id', userId);
      }
    } catch (err) {
      console.error('Failed to delete user and records from Supabase:', err);
    }
  }

  public deleteAccount(userId: string): boolean {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    this.saveUsers(this.users);
    try {
      localStorage.removeItem(`hbdms_app_data_user_${userId}`);
    } catch (e) {
      console.error('Error removing user data', e);
    }

    // Delete from Supabase cloud database
    this.deleteUserFromSupabase(userId);

    this.saveSession(null);
    return true;
  }
}

export const authService = new AuthService();
