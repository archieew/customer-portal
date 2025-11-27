/**
 * Next.js App Component
 * 
 * This is the root component that wraps all pages.
 * It provides global styles and authentication context.
 */

import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

