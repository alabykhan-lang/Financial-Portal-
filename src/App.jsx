import React from 'react';
import { useApp } from './context/AppContext';
import Splash from './components/core/Splash';
import AuthGate from './components/core/AuthGate';
import Portal from './components/core/Portal';

export default function App() {
  const { session, dbOk } = useApp();
  
  if (dbOk === null) return <Splash />;
  if (!session) return <AuthGate />;
  
  return <Portal />;
}
