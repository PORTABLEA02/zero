import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

export class StorageService {
  private static readonly DEFAULT_BUCKET_NAME = 'documents';
  private static readonly AVATARS_BUCKET_NAME = 'avatars';

  static async uploadFile(file: File, folder: string = 'general', bucketName: string = StorageService.DEFAULT_BUCKET_NAME): Promise<UploadResult | null> {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload du fichier
      const { data, error } = await supabase.storage
        .from(bucketName)
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
        .from(bucketName)
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

  static async deleteFile(filePath: string, bucketName: string = StorageService.DEFAULT_BUCKET_NAME): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
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

  static async getFileUrl(filePath: string, bucketName: string = StorageService.DEFAULT_BUCKET_NAME): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Get file URL error:', error);
      return null;
    }
  }

  static getDownloadUrl(filePath: string, bucketName: string = StorageService.DEFAULT_BUCKET_NAME): string {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Méthodes spécifiques pour les avatars
  static async uploadAvatar(file: File, userId: string): Promise<UploadResult | null> {
    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
    }

    // Valider la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Fichier trop volumineux. Taille maximale : 2 MB');
    }

    // Supprimer l'ancien avatar s'il existe
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile?.avatar_url) {
          const url = new URL(profile.avatar_url);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'avatars');
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const oldFilePath = pathParts.slice(bucketIndex).join('/');
            await this.deleteAvatar(oldFilePath);
          }
        }
      }
    } catch (error) {
      // Ne pas faire échouer l'upload si la suppression de l'ancien fichier échoue
      console.warn('Impossible de supprimer l\'ancien avatar:', error);
    }

    return this.uploadFile(file, `avatars/${userId}`, StorageService.AVATARS_BUCKET_NAME);
  }

  static async deleteAvatar(filePath: string): Promise<boolean> {
 const cleanPath = filePath.replace(/^avatars\//, "");
    console.error('bucket:',this.AVATARS_BUCKET_NAME);
  return this.deleteFile(cleanPath, this.AVATARS_BUCKET_NAME);
  }
}