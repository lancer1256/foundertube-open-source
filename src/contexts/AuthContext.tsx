import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isSignedIn: boolean;
  userEmail: string;
  setSignedIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check if user was previously signed in
    const savedEmail = localStorage.getItem('foundertube-user-email');
    if (savedEmail) {
      setIsSignedIn(true);
      setUserEmail(savedEmail);
    }
  }, []);

  const setSignedIn = (email: string) => {
    setIsSignedIn(true);
    setUserEmail(email);
    localStorage.setItem('foundertube-user-email', email);
  };

  const signOut = () => {
    setIsSignedIn(false);
    setUserEmail('');
    localStorage.removeItem('foundertube-user-email');
  };

  const value = {
    isSignedIn,
    userEmail,
    setSignedIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider; 