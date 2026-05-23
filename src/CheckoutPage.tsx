import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, Gift, Lock, PackageCheck, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useStore } from './store/useStore';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [copied, setCopied] = useState(false);

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal > 0 ? 6.95 : 0;
  const total = subtotal + shipping;

  const copyOrderReference = async () => {
    if (!orderReference) return;
    try {
      await navigator.clipboard.writeText(orderReference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error(error);
      alert('Could not copy the order reference.');
    }
  };

  const closeSuccessModal = () => {
    setOrderReference('');
    navigate('/');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      alert('Your gift bag is empty.');
      return;
    }

    if (!customerName.trim() || !email.trim() || !address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      alert('Please fill in all checkout fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: customerName, email, address, city, state, zip },
          items: cartItems.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            personalizationData: item.personalizationData,
          })),
          subtotal,
          shipping,
          total,
          currency: 'USD',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Checkout could not be created.');
      cartItems.forEach((item) => removeFromCart(item.id));
      setOrderReference(data.orderId || 'pending');
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-boutique-bg font-sans text-boutique-brown relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-pattern bg-[length:400px_400px]"></div>

      {orderReference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a251a]/30 px-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[2.4rem] border border-boutique-brown/10 bg-[#fcfaf6] p-8 text-center shadow-[0_30px_90px_rgba(58,37,26,0.28)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95)_0%,rgba(255,250,243,0.75)_38%,rgba(252,250,246,0.4)_72%)]"></div>
            <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -left-16 -top-12 w-52 opacity-45 mix-blend-multiply" alt="" />
            <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute -right-14 bottom-20 w-48 opacity-40 mix-blend-multiply" alt="" />
            <img src="/toy-wooden-star-solid.png" className="pointer-events-none absolute right-10 top-12 w-10 rotate-12 opacity-45 mix-blend-multiply" alt="" />
            <img src="/toy-abc-blocks.png" className="pointer-events-none absolute bottom-8 left-10 w-16 opacity-35 mix-blend-multiply" alt="" />

            <button onClick={closeSuccessModal} className="absolute right-5 top-5 z-10 rounded-full bg-white/75 p-2 text-boutique-brown-light shadow-sm hover:bg-boutique-bg">
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-green-600/10 bg-green-100 text-green-700 shadow-[0_12px_30px_rgba(22,101,52,0.16)]">
              <CheckCircle2 className="h-11 w-11" />
            </div>

            <div className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-boutique-brown-light">
              <Sparkles className="h-3.5 w-3.5" /> Gift request received
            </div>

            <h2 className="relative z-10 font-serif text-4xl text-boutique-brown md:text-5xl">Order Started</h2>
            <p className="relative z-10 mx-auto mt-3 max-w-sm text-sm leading-relaxed text-boutique-brown-light">
              Your personalized gift request has been created. Copy your reference number and keep it for your records.
            </p>

            <div className="relative z-10 mt-7 rounded-[1.6rem] border border-boutique-brown/10 bg-white/85 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-boutique-brown/60">
                <PackageCheck className="h-4 w-4" /> Order Reference
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-boutique-brown/10 bg-[#fffaf3] p-3">
                <code className="flex-1 select-all rounded-xl bg-white/70 px-3 py-3 text-left text-sm font-black tracking-[0.08em] text-boutique-brown">
                  {orderReference}
                </code>
                <button onClick={copyOrderReference} className="inline-flex h-12 items-center gap-1.5 rounded-full bg-boutique-brown px-4 text-xs font-bold text-white shadow-sm hover:bg-boutique-wood">
                  <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-5 grid gap-2 rounded-2xl bg-boutique-bg/80 p-4 text-left text-xs font-medium text-boutique-brown-light sm:grid-cols-3">
              <span className="flex items-center gap-2"><Gift className="h-4 w-4" /> Gift-ready</span>
              <span className="flex items-center gap-2"><PackageCheck className="h-4 w-4" /> Order tracked</span>
              <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Secure next step</span>
            </div>

            <div className="relative z-10 mt-7 flex flex-col gap-3">
              <button onClick={closeSuccessModal} className="rounded-full bg-boutique-brown px-5 py-4 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-boutique-wood">
                Continue Shopping
              </button>
              <p className="text-xs text-boutique-brown-light">Next step: connect Stripe payment and automated order emails.</p>
            </div>
          </div>
        </div>
      )}

      <header className="relative z-20 flex items-center justify-between border-b border-boutique-brown/10 bg-boutique-bg/80 px-6 py-5 backdrop-blur-md md:px-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-boutique-brown-light hover:text-boutique-brown"><ArrowLeft className="h-4 w-4" /> Back to shop</Link>
        <Link to="/" className="font-serif text-3xl text-boutique-brown">Little Wonders</Link>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-boutique-brown-light"><Lock className="h-4 w-4" /> Secure checkout</div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[58%_42%] md:py-14">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-boutique-brown/10 bg-white/75 p-6 shadow-sm md:p-8">
          <div><h1 className="font-serif text-4xl text-boutique-brown">Checkout</h1><p className="mt-2 text-sm text-boutique-brown-light">Enter your shipping details to prepare your personalized gift order.</p></div>
          <section className="space-y-4"><h2 className="text-sm font-bold uppercase tracking-wider text-boutique-brown">Contact</h2><div className="grid gap-4 md:grid-cols-2"><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="rounded-2xl border border-boutique-brown/15 bg-boutique-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-boutique-wood/40" placeholder="Full name" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-2xl border border-boutique-brown/15 bg-boutique-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-boutique-wood/40" placeholder="Email address" /></div></section>
          <section className="space-y-4"><h2 className="text-sm font-bold uppercase tracking-wider text-boutique-brown">Shipping address</h2><input value={address} onChange={(event) => setAddress(event.target.value)} className="w-full rounded-2xl border border-boutique-brown/15 bg-boutique-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-boutique-wood/40" placeholder="Street address" /><div className="grid gap-4 md:grid-cols-3"><input value={city} onChange={(event) => setCity(event.target.value)} className="rounded-2xl border border-boutique-brown/15 bg-boutique-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-boutique-wood/40" placeholder="City" /><input value={state} onChange={(event) => setState(event.target.value)} className="rounded-2xl border border-boutique-brown/15 bg-boutique-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-boutique-wood/40" placeholder="State" /><input value={zip} onChange={(event) => setZip(event.target.value)} className="rounded-2xl border border-boutique-brown/15 bg-boutique-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-boutique-wood/40" placeholder="ZIP code" /></div></section>
          <button disabled={isSubmitting || cartItems.length === 0} className="w-full rounded-full bg-boutique-brown px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-boutique-wood disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Preparing checkout...' : 'Continue to Payment'}</button>
        </form>

        <aside className="rounded-[2rem] border border-boutique-brown/10 bg-white/75 p-6 shadow-sm md:p-8 h-fit">
          <div className="mb-6 flex items-center gap-2"><ShoppingBag className="h-5 w-5" /><h2 className="font-serif text-2xl text-boutique-brown">Order Summary</h2></div>
          {cartItems.length === 0 ? <div className="rounded-2xl bg-boutique-bg p-6 text-center text-sm text-boutique-brown-light">Your gift bag is empty.</div> : <div className="space-y-4">{cartItems.map((item) => <div key={item.id} className="flex gap-4 rounded-2xl bg-boutique-bg p-3"><div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">{item.product.bgImage && <img src={item.product.bgImage} className="absolute inset-0 h-full w-full object-cover opacity-70" alt="" />}<img src={item.product.imageUrl} className="relative z-10 h-full w-full object-contain p-2" alt="" /></div><div className="min-w-0 flex-1"><p className="font-serif text-sm font-medium text-boutique-brown">{item.product.name}</p><p className="mt-1 text-xs text-boutique-brown-light">Qty {item.quantity}</p>{Object.keys(item.personalizationData).length > 0 && <p className="mt-1 truncate text-[11px] text-boutique-brown-light">Personalized</p>}</div><p className="text-sm font-bold text-boutique-brown">${(item.product.price * item.quantity).toFixed(2)}</p></div>)}</div>}
          <div className="mt-6 space-y-3 border-t border-boutique-brown/10 pt-5 text-sm"><div className="flex justify-between text-boutique-brown-light"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div className="flex justify-between text-boutique-brown-light"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div><div className="flex justify-between pt-3 font-serif text-xl text-boutique-brown"><span>Total</span><span>${total.toFixed(2)}</span></div></div>
        </aside>
      </main>
    </div>
  );
}
