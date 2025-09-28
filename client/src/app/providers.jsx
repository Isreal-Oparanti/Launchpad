'use client';

import { UserProvider } from '../context/AuthContext';



export default function Providers({ children }) {
  return (
     <UserProvider>     
          {children}
     </UserProvider>    
  );
}