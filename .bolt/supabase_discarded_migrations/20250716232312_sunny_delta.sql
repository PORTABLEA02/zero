/*
  # Ajout du champ avatar_url à la table profiles

  1. Modifications
    - Ajouter la colonne `avatar_url` à la table `profiles`
    - La colonne est nullable pour permettre aux utilisateurs de ne pas avoir d'avatar

  2. Sécurité
    - Aucune modification des politiques RLS nécessaire
    - Les politiques existantes couvrent déjà ce nouveau champ
*/

-- Ajouter la colonne avatar_url à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN profiles.avatar_url IS 'URL de l''avatar/photo de profil de l''utilisateur stockée dans Supabase Storage';