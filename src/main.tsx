import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import { firestoreSyncService } from './services/firestoreSyncService';

// Initialize Service Worker for offline asset caching and background sync
registerServiceWorker();

// Initialize Cloud Firestore real-time synchronization across all systems and devices
firestoreSyncService.init().catch(console.warn);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
