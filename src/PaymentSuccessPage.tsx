import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Copy, PackageCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useStore } from './store/useStore';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderReference = searchParams.get('order') || '';
  const { clearCart } = useStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const copyOrderReference = async () => {
    if (!orderReference) return;
    await navigator.clipboard.writeText(orderReference);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-boutique-bg font-sans text-boutique-brown">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-pattern bg-[length:400px_400px]"></div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.96)_0%,rgba(252,250,246,0.65)_40%,rgba(252,250,246,0)_78%)]"></div>
      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="relative w-full overflow-hidden rounded-[2.4rem] border border-boutique-brown/10 bg-white/85 p-8 text-center shadow-[0_30px_90px_rgba(58,37,26,0.16)] backdrop-blur-sm md:p-10">
          <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -left-16 -top-12 w-56 opacity-40 mix-blend-multiply" alt="" />
          <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute -right-16 bottom-16 w-52 opacity-35 mix-blend-multiply" alt="" />
          <img src="/toy-wooden-star-solid.png" className="pointer-events-none absolute right-10 top-12 w-10 rotate-12 opacity-45 mix-blend-multiply" alt="" />
          <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-[0_12px_30px_rgba(22,101,52,0.16)]">
            <CheckCircle2 className="h-11 w-11" />
          </div>
          <div className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-[#fffaf3] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-boutique-brown-light">
            <Sparkles className="h-3.5 w-3.5" /> Payment confirmed
          </div>
          <h1 className="relative z-10 font-serif text-4xl text-boutique-brown md:text-6xl">Thank You!</h1>
          <p className="relative z-10 mx-auto mt-4 max-w-md text-sm leading-relaxed text-boutique-brown-light">
            Your payment was completed successfully. We received your Little Wonders gift order and will start preparing it soon.
          </p>
          {orderReference && (
            <div className="relative z-10 mt-7 rounded-[1.6rem] border border-boutique-brown/10 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-boutique-brown/60">
                <PackageCheck className="h-4 w-4" /> Order Reference
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-boutique-bg p-3">
                <code className="flex-1 select-all rounded-xl bg-white/80 px-3 py-3 text-left text-sm font-black tracking-[0.08em] text-boutique-brown">{orderReference}</code>
                <button onClick={copyOrderReference} className="inline-flex h-12 items-center gap-1.5 rounded-full bg-boutique-brown px-4 text-xs font-bold text-white hover:bg-boutique-wood">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>
          )}
          <div className="relative z-10 mt-7 grid gap-3 sm:grid-cols-2">
            <Link to="/" className="rounded-full bg-boutique-brown px-5 py-4 text-sm font-bold text-white hover:bg-boutique-wood">Continue Shopping</Link>
            <Link to="/track-order" className="inline-flex items-center justify-center gap-2 rounded-full border border-boutique-brown/15 bg-white px-5 py-4 text-sm font-bold text-boutique-brown hover:bg-boutique-bg">
              <ShoppingBag className="h-4 w-4" /> Track Order
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
