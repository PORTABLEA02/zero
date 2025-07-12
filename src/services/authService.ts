import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'membre' | 'controleur' | 'administrateur';
  mustChangePassword?: boolean;
  isFirstLogin?: boolean;
  lastPasswordChange?: string;
}

export class AuthService {
  static async signIn(email: string, password: string): Promise<AuthUser | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth error:', authError);
        return null;
      }

      if (!authData.user) {
        return null;
      }

      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        return null;
      }

      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role,
        mustChangePassword: profile.must_change_password,
        isFirstLogin: profile.is_first_login,
        lastPasswordChange: profile.last_password_change
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return null;
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Get current user error:', error);
        return null;
      }

      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role,
        mustChangePassword: profile.must_change_password,
        isFirstLogin: profile.is_first_login,
        lastPasswordChange: profile.last_password_change
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Update password error:', updateError);
        return false;
      }

      // Mettre à jour le profil
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            must_change_password: false,
            is_first_login: false,
            last_password_change: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  }
}