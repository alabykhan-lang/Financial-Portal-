import React from 'react';
import { useApp } from './context/AppContext';
import Splash from './components/Splash';
import AuthGate from './components/AuthGate';
import Portal from './components/Portal';

export default function App() {
  const { session, dbOk } = useApp();
  
  if (dbOk === null) return <Splash />;
  if (!session) return <AuthGate />;
  
  return <Portal />;
}