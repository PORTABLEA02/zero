import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Users, Eye, Edit } from 'lucide-react';

interface UserPreview {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  service: string;
  adresse: string;
  mot_de_passe: string;
  errors: string[];
  lineNumber: number;
}

export function ImportationUtilisateurs() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [usersPreviews, setUsersPreviews] = useState<UserPreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    total: number;
    details: string[];
  } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setShowPreview(false);
      setUsersPreviews([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setShowPreview(false);
      setUsersPreviews([]);
    }
  };

  const parseCSVFile = (file: File): Promise<UserPreview[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const users: UserPreview[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const errors: string[] = [];
            
            // Validation des données
            const nom = values[headers.indexOf('nom')] || '';
            const prenom = values[headers.indexOf('prenom')] || '';
            const email = values[headers.indexOf('email')] || '';
            const telephone = values[headers.indexOf('telephone')] || '';
            const service = values[headers.indexOf('service')] || '';
            const adresse = values[headers.indexOf('adresse')] || '';
            const mot_de_passe = values[headers.indexOf('mot_de_passe')] || '';
            
            // Validation
            if (!nom) errors.push('Nom manquant');
            if (!prenom) errors.push('Prénom manquant');
            if (!email) errors.push('Email manquant');
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Format email invalide');
            if (!telephone) errors.push('Téléphone manquant');
            if (!mot_de_passe) errors.push('Mot de passe manquant');
            else if (mot_de_passe.length < 8) errors.push('Mot de passe trop court (min. 8 caractères)');
            
            users.push({
              nom,
              prenom,
              email,
              telephone,
              service,
              adresse,
              mot_de_passe,
              errors,
              lineNumber: i + 1
            });
          }
          
          resolve(users);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const handlePreviewFile = async () => {
    if (!uploadedFile) return;
    
    try {
      const users = await parseCSVFile(uploadedFile);
      setUsersPreviews(users);
      setShowPreview(true);
    } catch (error) {
      console.error('Erreur lors de l\'analyse du fichier:', error);
      alert('Erreur lors de l\'analyse du fichier. Vérifiez le format.');
    }
  };

  const simulateImport = () => {
    const validUsers = usersPreviews.filter(user => user.errors.length === 0);
    const invalidUsers = usersPreviews.filter(user => user.errors.length > 0);
    
    // Simulation d'importation
    setTimeout(() => {
      setImportResults({
        success: validUsers.length,
        errors: invalidUsers.length,
        total: usersPreviews.length,
        details: [
          `${validUsers.length} utilisateurs importés avec succès`,
          `${invalidUsers.length} erreurs détectées`,
          ...invalidUsers.slice(0, 5).map(user => 
            `Ligne ${user.lineNumber}: ${user.errors.join(', ')}`
          )
        ]
      });
      setShowPreview(false);
    }, 2000);
  };

  const downloadTemplate = () => {
    // Simulation du téléchargement du modèle
    const csvContent = "nom,prenom,email,telephone,service,adresse,mot_de_passe\nDupont,Jean,jean.dupont@email.com,+221771234567,Informatique,Dakar,motdepasse123\nMartin,Marie,marie.martin@email.com,+221769876543,Comptabilite,Thies,password456\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele_import_adherents.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validUsers = usersPreviews.filter(user => user.errors.length === 0);
  const invalidUsers = usersPreviews.filter(user => user.errors.length > 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Importation utilisateurs</h1>
        <p className="text-gray-600">Importez en masse les adhérents via un fichier CSV ou Excel</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions d'importation</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Utilisez le modèle CSV fourni pour structurer vos données</li>
          <li>• Champs obligatoires : nom, prénom, email, téléphone, mot_de_passe</li>
          <li>• Format accepté : CSV, Excel (.xlsx)</li>
          <li>• Taille maximale : 10 MB</li>
          <li>• Maximum 1000 utilisateurs par importation</li>
          <li>• Le mot de passe sera utilisé tel quel pour chaque utilisateur</li>
          <li>• Recommandation : utilisez des mots de passe sécurisés (min. 8 caractères)</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone d'upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Télécharger le fichier</h3>
          
          {/* Bouton de téléchargement du modèle */}
          <div className="mb-4">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le modèle CSV
            </button>
          </div>

          {/* Zone de drag & drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ou cliquez pour sélectionner un fichier
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Sélectionner un fichier
            </label>
          </div>

          {/* Fichier sélectionné */}
          {uploadedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setShowPreview(false);
                    setUsersPreviews([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handlePreviewFile}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Prévisualiser
                </button>
                {showPreview && usersPreviews.length > 0 && (
                  <button
                    onClick={simulateImport}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Lancer l'importation
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Résultats d'importation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Résultats d'importation</h3>
          
          {!importResults ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune importation en cours</p>
              <p className="text-sm text-gray-400">Les résultats s'afficheront ici après l'importation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-sm text-green-800">Succès</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                  <div className="text-sm text-red-800">Erreurs</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                  <div className="text-sm text-blue-800">Total</div>
                </div>
              </div>

              {/* Détails */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Détails de l'importation</h4>
                <div className="space-y-2">
                  {importResults.details.map((detail, index) => (
                    <div key={index} className="flex items-start text-sm">
                      {detail.includes('succès') ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={detail.includes('succès') ? 'text-green-700' : 'text-red-700'}>
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Télécharger le rapport
                </button>
                <button 
                  onClick={() => setImportResults(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nouvelle importation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && usersPreviews.length > 0 && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Prévisualisation des utilisateurs ({usersPreviews.length})
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Statistiques de prévisualisation */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{validUsers.length}</div>
                <div className="text-sm text-green-800">Valides</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{invalidUsers.length}</div>
                <div className="text-sm text-red-800">Erreurs</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{usersPreviews.length}</div>
                <div className="text-sm text-blue-800">Total</div>
              </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h4 className="font-medium text-gray-900">Utilisateurs à importer</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ligne</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersPreviews.map((user, index) => (
                      <tr key={index} className={user.errors.length > 0 ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.lineNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.nom}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.prenom}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.telephone}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.service}</td>
                        <td className="px-4 py-3 text-sm">
                          {user.errors.length === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Valide
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erreur
                              </span>
                              <div className="text-xs text-red-600">
                                {user.errors.join(', ')}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                {validUsers.length > 0 && (
                  <span className="text-green-600 font-medium">
                    {validUsers.length} utilisateur(s) seront importés
                  </span>
                )}
                {invalidUsers.length > 0 && (
                  <span className="text-red-600 font-medium ml-4">
                    {invalidUsers.length} erreur(s) détectée(s)
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                {validUsers.length > 0 && (
                  <button
                    onClick={simulateImport}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    Importer {validUsers.length} utilisateur(s)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historique des importations */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des importations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">Importation du 20/01/2024</h4>
                  <p className="text-sm text-gray-600">Fichier: adherents_janvier_2024.csv</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Réussie
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-600">45</span> importés
                </div>
                <div>
                  <span className="font-medium text-red-600">3</span> erreurs
                </div>
                <div>
                  <span className="font-medium text-gray-600">48</span> total
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Mots de passe configurés automatiquement pour tous les utilisateurs importés
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}