import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

export class StorageService {
  private static readonly BUCKET_NAME = 'documents';
  private static readonly AVATARS_BUCKET = 'avatars';

  static async uploadFile(file: File, folder: string = 'general'): Promise<UploadResult | null> {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload du fichier
      const { data, error } = await supabase.storage
        .from(StorageService.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(StorageService.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        name: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('Storage service error:', error);
      return null;
    }
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(StorageService.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete file error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Storage service error:', error);
      return false;
    }
  }

  static async getFileUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(StorageService.BUCKET_NAME)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Get file URL error:', error);
      return null;
    }
  }

  static getDownloadUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(StorageService.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  static async uploadAvatar(file: File, userId: string): Promise<UploadResult | null> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WebP.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Fichier trop volumineux. Taille maximale : 5 MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Delete existing avatar if it exists
      await supabase.storage
        .from(StorageService.AVATARS_BUCKET)
        .remove([filePath]);

      // Upload new avatar
      const { data, error } = await supabase.storage
        .from(StorageService.AVATARS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Avatar upload error:', error);
        throw new Error('Erreur lors du téléchargement de l\'avatar');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(StorageService.AVATARS_BUCKET)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        name: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('Avatar upload service error:', error);
      throw error;
    }
  }

  static async deleteAvatar(userId: string): Promise<boolean> {
    try {
      // Try to delete common avatar file extensions
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      const filesToDelete = extensions.map(ext => `avatars/${userId}.${ext}`);

      const { error } = await supabase.storage
        .from(StorageService.AVATARS_BUCKET)
        .remove(filesToDelete);

      if (error) {
        console.error('Delete avatar error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Avatar delete service error:', error);
      return false;
    }
  }
}