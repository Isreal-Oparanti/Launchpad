'use client';


import { CivicAuthProvider } from "@civic/auth/nextjs";

export default function Providers({ children }) {
  return (
    <CivicAuthProvider>
      {children}
    </CivicAuthProvider>
  );
}