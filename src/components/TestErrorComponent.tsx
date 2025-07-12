// Composant de test pour déclencher des erreurs (à utiliser uniquement en développement)

import React, { useState } from 'react';
import { AlertTriangle, Bug } from 'lucide-react';

export const TestErrorComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Erreur de test déclenchée intentionnellement');
  }

  const triggerAsyncError = async () => {
    try {
      // Simuler une erreur async
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Erreur asynchrone de test')), 1000);
      });
    } catch (error) {
      console.error('Erreur async capturée:', error);
    }
  };

  const triggerRenderError = () => {
    setShouldThrow(true);
  };

  // Ne pas afficher en production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg">
      <div className="flex items-center mb-2">
        <Bug className="h-4 w-4 text-yellow-600 mr-2" />
        <span className="text-sm font-medium text-yellow-800">Test d'erreurs (Dev)</span>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={triggerRenderError}
          className="w-full px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Déclencher erreur de rendu
        </button>
        
        <button
          onClick={triggerAsyncError}
          className="w-full px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Déclencher erreur async
        </button>
      </div>
      
      <p className="text-xs text-yellow-700 mt-2">
        Utilisez ces boutons pour tester la gestion d'erreurs
      </p>
    </div>
  );
};