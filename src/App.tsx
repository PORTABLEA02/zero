import React from 'react';
import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DemandeProvider } from './contexts/DemandeContext';
import { FamilleProvider } from './contexts/FamilleContext';
import { Layout } from './components/Layout';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <Dashboard activeView={activeView} onViewChange={setActiveView} />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <FamilleProvider>
        <DemandeProvider>
          <AppContent />
        </DemandeProvider>
      </FamilleProvider>
    </AuthProvider>
  );
}

export default App;