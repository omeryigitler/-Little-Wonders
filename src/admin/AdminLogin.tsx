import React, { useEffect } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin = (_props: AdminLoginProps) => {
  useEffect(() => {
    window.location.replace('/login');
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-boutique-bg px-6 py-10 font-sans text-boutique-brown">
      <div className="pointer-events-none fixed inset-0 opacity-40 bg-pattern bg-[length:420px_420px]"></div>
      <div className="relative z-10 rounded-[2rem] border border-boutique-brown/10 bg-white/86 p-7 text-center shadow-[0_24px_70px_rgba(58,37,26,0.12)] backdrop-blur-sm">
        <p className="text-sm font-bold text-boutique-brown">Redirecting to sign in...</p>
      </div>
    </div>
  );
};
