
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster as SonnerToaster } from "sonner"
import logger from './utils/logger.ts'

// Log app initialization - only appears in development
logger.info('Application initializing', { 
  timestamp: new Date().toISOString(),
  environment: import.meta.env.MODE
});

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <SonnerToaster />
  </>
);
