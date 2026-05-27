import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react';
import { getMemberAuthErrorFromUrl, startGoogleMemberLogin } from './memberAuth';

const AppleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M17.05 12.38c-.02-2.06 1.68-3.05 1.76-3.1-.96-1.4-2.45-1.59-2.98-1.61-1.27-.13-2.48.75-3.12.75-.65 0-1.64-.73-2.7-.71-1.39.02-2.68.81-3.39 2.05-1.45 2.51-.37 6.22 1.04 8.26.69.99 1.51 2.11 2.59 2.07 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.71.65 1.12-.02 1.83-1.01 2.51-2.01.79-1.15 1.12-2.27 1.14-2.33-.03-.01-2.18-.84-2.25-3.35ZM15 6.33c.57-.69.96-1.65.85-2.61-.82.03-1.81.55-2.4 1.23-.53.61-.99 1.59-.86 2.52.91.07 1.84-.46 2.41-1.14Z" />
  </svg>
);

export default function AccountLoginPage() {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const authError = getMemberAuthErrorFromUrl();
    if (authError) setError(authError);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-boutique-bg px-6 py-10 font-sans text-boutique-brown">
      <div className="pointer-events-none fixed inset-0 opacity-40 bg-pattern bg-[length:420px_420px]"></div>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.92)_0%,rgba(252,250,246,0.55)_42%,rgba(252,250,246,0)_78%)]"></div>
      <div className="pointer-events-none absolute left-[8%] top-[12%] hidden h-24 w-24 rounded-full bg-[#f7d9c8]/45 blur-xl md:block"></div>
      <div className="pointer-events-none absolute right-[11%] top-[18%] hidden h-28 w-28 rounded-full bg-[#cfe9f7]/45 blur-xl md:block"></div>
      <div className="pointer-events-none absolute bottom-[12%] left-[15%] hidden h-24 w-24 rounded-full bg-[#f8e6a8]/45 blur-xl md:block"></div>
      <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -right-14 top-24 hidden w-72 opacity-45 mix-blend-multiply md:block" alt="" />
      <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute -left-14 bottom-16 hidden w-72 opacity-40 mix-blend-multiply md:block" alt="" />
      <img src="/toy-abc-blocks.png" className="pointer-events-none absolute right-[18%] bottom-[12%] hidden w-20 -rotate-6 opacity-35 mix-blend-multiply lg:block" alt="" />
      <img src="/toy-wooden-star-solid.png" className="pointer-events-none absolute left-[22%] top-[22%] hidden w-10 rotate-12 opacity-35 mix-blend-multiply lg:block" alt="" />
      <div className="pointer-events-none absolute top-12 hidden w-[620px] max-w-[78vw] rounded-full border border-boutique-brown/10 bg-white/30 px-10 py-4 text-center text-xs font-bold uppercase tracking-[0.24em] text-boutique-brown/45 shadow-sm backdrop-blur-sm md:block">
        Soft gifts, tiny smiles, magical keepsakes
      </div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-boutique-brown/10 bg-white/92 p-7 shadow-[0_28px_90px_rgba(58,37,26,0.15)] backdrop-blur-sm">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-boutique-brown-light hover:text-boutique-brown">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-boutique-brown text-white shadow-sm">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-[#fffaf3] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-boutique-brown-light">
            <Sparkles className="h-3.5 w-3.5" /> MY BABY SHIRE
          </div>
          <h1 className="font-serif text-4xl leading-none text-boutique-brown">Welcome back</h1>
          <p className="mt-3 text-sm leading-relaxed text-boutique-brown-light">
            Sign in to view your orders, save delivery details and enjoy a smoother checkout.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
        )}

        <div className="grid gap-3">
          <button
            type="button"
            onClick={startGoogleMemberLogin}
            className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-boutique-brown/10 bg-white px-4 py-4 text-sm font-bold text-boutique-brown shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#fffaf3]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-black text-[#4285f4] shadow-sm">G</span>
            Continue with Google
          </button>
          <button type="button" onClick={() => setNotice({ title: 'Apple sign in', message: 'Apple sign in is coming soon. Please use Google sign in while we finish this option.' })} className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-boutique-brown/10 bg-white px-4 py-4 text-sm font-bold text-boutique-brown shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#fffaf3]">
            <AppleIcon /> Continue with Apple
          </button>
          <button type="button" onClick={() => setNotice({ title: 'Email sign in', message: 'Email sign in is being prepared. For now, please continue with Google to access your account securely.' })} className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-boutique-brown/10 bg-white px-4 py-4 text-sm font-bold text-boutique-brown shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#fffaf3]">
            <Mail className="h-5 w-5" /> Continue with Email
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-boutique-brown/10 bg-[#fffaf3]/80 p-4 text-xs leading-relaxed text-boutique-brown-light">
          <div className="mb-2 flex items-center gap-2 font-bold text-boutique-brown">
            <ShieldCheck className="h-4 w-4" /> Secure sign in
          </div>
          Your account helps us keep your order history and delivery details ready for your next gift.
        </div>
      </div>

      {notice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-boutique-brown/35 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-boutique-brown/10 bg-white p-6 text-center shadow-[0_24px_70px_rgba(58,37,26,0.18)]">
            <button onClick={() => setNotice(null)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-boutique-bg text-boutique-brown-light hover:text-boutique-brown" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <h2 className="mt-2 font-serif text-3xl text-boutique-brown">{notice.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-boutique-brown-light">{notice.message}</p>
            <button onClick={() => setNotice(null)} className="mt-6 w-full rounded-2xl bg-boutique-brown px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-boutique-brown-light">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
