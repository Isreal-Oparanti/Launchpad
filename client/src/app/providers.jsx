'use client';

import { UserProvider } from '../context/AuthContext';

import { CivicAuthProvider } from "@civic/auth/nextjs";

export default function Providers({ children }) {
  return (
     <UserProvider>     
        <CivicAuthProvider>
          {children}
        </CivicAuthProvider>
     </UserProvider>    
  );
}