import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, PackageCheck, ShoppingBag } from 'lucide-react';
import { useStore } from './store/useStore';

export default function PayPalSuccessPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const orderReference = searchParams.get('order') || '';
  const { clearCart } = useStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your PayPal payment...');

  useEffect(() => {
    const capturePayment = async () => {
      try {
        const response = await fetch('/api/paypal-capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, orderNumber: orderReference }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(text.includes('<!doctype') || text.includes('<html') ? 'PayPal confirmation endpoint returned a website page instead of JSON. Please redeploy and try again.' : text);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || 'PayPal payment could not be confirmed.');
        }

        clearCart();
        setStatus('success');
        setMessage('Your PayPal payment was completed successfully.');
      } catch (error) {
        setStatus('error');
        setMessage((error as Error).message);
      }
    };

    if (token && orderReference) {
      capturePayment();
    } else {
      setStatus('error');
      setMessage('Missing PayPal payment information.');
    }
  }, [token, orderReference, clearCart]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-boutique-bg font-sans text-boutique-brown">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-pattern bg-[length:400px_400px]"></div>
      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="relative w-full overflow-hidden rounded-[2.4rem] border border-boutique-brown/10 bg-white/85 p-8 text-center shadow-[0_30px_90px_rgba(58,37,26,0.16)] backdrop-blur-sm md:p-10">
          <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -left-16 -top-12 w-56 opacity-40 mix-blend-multiply" alt="" />
          <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute -right-16 bottom-16 w-52 opacity-35 mix-blend-multiply" alt="" />

          <div className={`relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${status === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status === 'loading' ? <Loader2 className="h-10 w-10 animate-spin" /> : <CheckCircle2 className="h-11 w-11" />}
          </div>

          <h1 className="relative z-10 font-serif text-4xl text-boutique-brown md:text-5xl">
            {status === 'loading' ? 'Confirming Payment' : status === 'success' ? 'Thank You!' : 'Payment Check Failed'}
          </h1>
          <p className="relative z-10 mx-auto mt-4 max-w-md text-sm leading-relaxed text-boutique-brown-light">{message}</p>

          {orderReference && (
            <div className="relative z-10 mt-7 rounded-[1.6rem] border border-boutique-brown/10 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-boutique-brown/60">
                <PackageCheck className="h-4 w-4" /> Order Reference
              </div>
              <code className="block select-all rounded-xl bg-boutique-bg px-3 py-3 text-center text-sm font-black tracking-[0.08em] text-boutique-brown">{orderReference}</code>
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
