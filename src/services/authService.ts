import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import { AuditService } from './auditService';

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

  static async createUser(email: string, password: string, userData: {
    full_name: string;
    role: 'membre' | 'controleur' | 'administrateur';
    phone?: string;
    address?: string;
    service?: string;
  }): Promise<AuthUser | null> {
    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });

      if (authError || !authData.user) {
        console.error('Create user error:', authError);
        return null;
      }

      // Le profil sera créé automatiquement par le trigger handle_new_user
      // Attendre un peu pour que le trigger s'exécute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le profil avec les informations supplémentaires
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: userData.phone,
          address: userData.address,
          service: userData.service,
          must_change_password: true,
          is_first_login: true,
          adhesion_number: userData.role === 'membre' ? `MUS-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}` : null,
          employee_number: userData.role !== 'membre' ? `EMP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}` : null,
          date_adhesion: userData.role === 'membre' ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Update profile error:', updateError);
      }

      // Log de création d'utilisateur
      await AuditService.createLog(
        'Création utilisateur',
        `Nouvel utilisateur créé: ${userData.full_name} (${email})`,
        'success',
        'Administration'
      );

      return {
        id: authData.user.id,
        name: userData.full_name,
        email: email,
        role: userData.role
      };
    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  }

  static async resetUserPassword(userId: string, email: string): Promise<boolean> {
    try {
      // Réinitialiser le mot de passe via l'API Admin
      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email
      });

      if (error) {
        console.error('Reset password error:', error);
        return false;
      }

      // Marquer que l'utilisateur doit changer son mot de passe
      await supabase
        .from('profiles')
        .update({
          must_change_password: true,
          is_first_login: true
        })
        .eq('id', userId);

      // Log de réinitialisation
      await AuditService.createLog(
        'Réinitialisation mot de passe',
        `Mot de passe réinitialisé pour ${email}`,
        'info',
        'Administration'
      );

      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  }
}