import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2A2A35',
              color: '#E5E5E5',
              border: '1px solid #3A3A45',
            },
            success: {
              iconTheme: {
                primary: '#E89518',
                secondary: '#1A1A23',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC3545',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);