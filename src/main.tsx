
import React from 'react'; // Make sure React is imported
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
