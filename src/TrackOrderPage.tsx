import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Gift,
  MapPin,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';

type TrackedOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  paymentStatus: string;
  trackingReference?: string | null;
  totalAmount: number;
  currency: string;
  createdAt: string;
  shippingCity?: string;
  shippingState?: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    personalizationData: Record<string, string>;
  }[];
};

const STATUS_STEPS = [
  { key: 'processing', label: 'Preparing', icon: Clock3, completeLabel: 'In progress', pendingLabel: 'Waiting', completeNote: 'We are preparing your gift.', pendingNote: 'Your order will be prepared after payment is confirmed.' },
  { key: 'shipped', label: 'Shipping', icon: Truck, completeLabel: 'Shipped', pendingLabel: 'Not shipped yet', completeNote: 'Your order is on the way.', pendingNote: 'Your gift has not been shipped yet.' },
  { key: 'delivered', label: 'Delivery', icon: CheckCircle2, completeLabel: 'Delivered', pendingLabel: 'Not delivered yet', completeNote: 'Delivered to your address.', pendingNote: 'Delivery will update after shipping.' },
];

const getStepState = (orderStatus: string, stepKey: string) => {
  const orderIndex = STATUS_STEPS.findIndex((step) => step.key === orderStatus);
  const stepIndex = STATUS_STEPS.findIndex((step) => step.key === stepKey);

  if (orderStatus === 'cancelled') return 'cancelled';
  if (orderIndex >= stepIndex) return 'complete';
  return 'pending';
};

export default function TrackOrderPage() {
  const [orderReference, setOrderReference] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState('');

  const copyText = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      alert('Could not copy.');
    }
  };

  const handleTrack = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setOrder(null);

    const reference = orderReference.trim();

    if (!reference) {
      setErrorMessage('Please enter your order reference.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(reference)}/tracking`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Order could not be found.');
      }

      setOrder(data);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-boutique-bg font-sans text-boutique-brown">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-45 bg-pattern bg-[length:400px_400px]"></div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.92)_0%,rgba(252,250,246,0.55)_34%,rgba(252,250,246,0)_72%)]"></div>

      <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute left-[-70px] top-[120px] z-0 hidden w-72 opacity-50 mix-blend-multiply md:block" alt="" />
      <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute right-[-60px] top-[210px] z-0 hidden w-80 opacity-45 mix-blend-multiply md:block" alt="" />
      <img src="/toy-wooden-star-solid.png" className="pointer-events-none absolute left-[8%] top-[170px] z-0 hidden w-10 rotate-12 opacity-60 mix-blend-multiply lg:block" alt="" />
      <img src="/toy-abc-blocks.png" className="pointer-events-none absolute right-[9%] top-[360px] z-0 hidden w-16 -rotate-6 opacity-45 mix-blend-multiply lg:block" alt="" />
      <img src="/toy-pull-duck.png" className="pointer-events-none absolute right-[4%] bottom-[120px] z-0 hidden w-36 opacity-50 mix-blend-multiply xl:block" alt="" />

      <header className="relative z-20 flex items-center justify-between border-b border-boutique-brown/10 bg-boutique-bg/85 px-6 py-5 backdrop-blur-md md:px-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-boutique-brown-light hover:text-boutique-brown">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
        <Link to="/" className="flex items-center gap-2 font-serif text-3xl text-boutique-brown">
          Little Wonders <img src="/decorative-moon-star.png" className="h-7 w-7 object-contain opacity-75" alt="" />
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-boutique-brown-light">
          <PackageCheck className="h-4 w-4" /> Order tracking
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-wider text-boutique-brown-light shadow-sm">
            <Sparkles className="h-4 w-4" /> Follow your Little Wonders order
          </div>
          <h1 className="font-serif text-5xl leading-none text-boutique-brown md:text-7xl">Order Tracking</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-boutique-brown-light">
            Enter your Little Wonders order reference to see the latest status, shipping progress, and gift details.
          </p>
        </div>

        <form onSubmit={handleTrack} className="relative mx-auto mt-8 max-w-3xl rounded-[2.2rem] border border-boutique-brown/10 bg-white/80 p-4 shadow-[0_20px_60px_rgba(58,37,26,0.10)] backdrop-blur-sm">
          <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -left-10 -top-8 w-32 opacity-30 mix-blend-multiply" alt="" />
          <img src="/toy-wooden-star-solid.png" className="pointer-events-none absolute right-8 top-4 w-8 rotate-12 opacity-35 mix-blend-multiply" alt="" />
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row">
            <input
              value={orderReference}
              onChange={(event) => setOrderReference(event.target.value)}
              className="min-h-16 flex-1 rounded-full border border-boutique-brown/10 bg-[#fffaf3] px-6 text-sm font-semibold uppercase tracking-wide text-boutique-brown outline-none transition-all focus:ring-2 focus:ring-boutique-wood/35"
              placeholder="LW-XXXXXXXX-XXXXX"
            />
            <button disabled={isLoading} className="inline-flex min-h-16 items-center justify-center gap-2 rounded-full bg-boutique-brown px-7 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-boutique-wood disabled:opacity-50">
              <Search className="h-4 w-4" /> {isLoading ? 'Checking...' : 'Track Order'}
            </button>
          </div>
        </form>

        {errorMessage && <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{errorMessage}</div>}

        {order && (
          <section className="relative mt-10 overflow-hidden rounded-[2.4rem] border border-boutique-brown/10 bg-white/85 shadow-[0_24px_70px_rgba(58,37,26,0.10)] backdrop-blur-sm">
            <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute -left-12 bottom-20 w-44 opacity-30 mix-blend-multiply" alt="" />
            <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -right-14 top-8 w-52 opacity-30 mix-blend-multiply" alt="" />
            <div className="relative border-b border-boutique-brown/10 bg-[#fffaf3] px-6 py-7 md:px-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-boutique-brown/60">Order Reference</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="font-serif text-3xl leading-tight text-boutique-brown md:text-5xl">{order.orderNumber}</h2>
                    <button onClick={() => copyText(order.orderNumber, 'order')} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-boutique-brown shadow-sm hover:bg-boutique-bg">
                      <Copy className="h-3.5 w-3.5" /> {copied === 'order' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-boutique-brown-light">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:w-[320px]">
                  <div className="rounded-2xl border border-boutique-brown/10 bg-white px-5 py-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-boutique-brown/60">Total</p>
                    <p className="mt-1 text-2xl font-bold text-boutique-brown">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl border border-boutique-brown/10 bg-white px-5 py-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-boutique-brown/60">Payment</p>
                    <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : order.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'}`}>{order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Awaiting payment'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative px-6 py-7 md:px-8">
              {order.orderStatus === 'cancelled' ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">This order has been cancelled.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {STATUS_STEPS.map((step) => {
                    const Icon = step.icon;
                    const state = getStepState(order.orderStatus, step.key);
                    const isComplete = state === 'complete';
                    return (
                      <div key={step.key} className={`rounded-[1.7rem] border p-5 shadow-sm transition-all ${isComplete ? 'border-green-200 bg-green-50/90 text-green-800' : 'border-boutique-brown/10 bg-[#fffaf3] text-boutique-brown-light opacity-85'}`}>
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isComplete ? 'bg-green-100' : 'bg-white'}`}><Icon className="h-5 w-5" /></div>
                          <div>
                            <p className="text-xl font-bold">{step.label}</p>
                            <p className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${isComplete ? 'bg-green-100 text-green-800' : 'bg-white text-boutique-brown-light'}`}>{isComplete ? step.completeLabel : step.pendingLabel}</p>
                            <p className="mt-2 text-sm opacity-80">{isComplete ? step.completeNote : step.pendingNote}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <InfoCard icon={MapPin} title="Shipping details" content={<><p className="font-semibold text-boutique-brown">{order.customerName}</p><p className="text-sm text-boutique-brown-light">{order.customerEmail}</p>{(order.shippingCity || order.shippingState) && <p className="mt-2 text-sm text-boutique-brown-light">{order.shippingCity}, {order.shippingState}</p>}</>} />
                <InfoCard icon={Truck} title="Shipment tracking" content={<><div className="flex items-center gap-2"><p className="font-bold text-boutique-brown">{order.trackingReference || 'Not shipped yet'}</p>{order.trackingReference && <button onClick={() => copyText(order.trackingReference || '', 'tracking')} className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-boutique-brown shadow-sm">{copied === 'tracking' ? 'Copied' : 'Copy'}</button>}</div><p className="mt-2 text-sm text-boutique-brown-light">A tracking number will appear here once your gift has been shipped.</p></>} />
                <InfoCard icon={CreditCard} title="Order summary" content={<><p className="font-semibold text-boutique-brown">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p><p className="text-sm text-boutique-brown-light">Payment: {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Awaiting payment'}</p><p className="mt-2 text-sm text-boutique-brown-light">Total: ${order.totalAmount.toFixed(2)}</p></>} />
              </div>

              <div className="mt-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-wider text-boutique-brown-light"><Gift className="h-4 w-4" /> Items in your order</div>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={`${item.productName}-${index}`} className="relative overflow-hidden rounded-[1.9rem] border border-boutique-brown/10 bg-white p-5 shadow-sm">
                      <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute right-4 top-3 w-24 opacity-20 mix-blend-multiply" alt="" />
                      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div><p className="font-serif text-2xl font-medium text-boutique-brown">{item.productName}</p><p className="mt-1 text-sm text-boutique-brown-light">Qty {item.quantity} × ${item.price.toFixed(2)}</p></div>
                        <div className="rounded-2xl bg-[#fffaf3] px-4 py-3 text-right"><p className="text-[11px] font-bold uppercase tracking-wider text-boutique-brown/60">Line Total</p><p className="mt-1 text-xl font-bold text-boutique-brown">${(item.quantity * item.price).toFixed(2)}</p></div>
                      </div>
                      {Object.keys(item.personalizationData).length > 0 && <div className="mt-4 rounded-2xl border border-boutique-brown/10 bg-boutique-bg/75 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-boutique-brown/60">Personalization Details</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(item.personalizationData).map(([key, value]) => <div key={key} className="rounded-xl bg-white/80 px-3 py-2 text-xs text-boutique-brown-light"><span className="font-bold text-boutique-brown">{key}: </span>{String(value)}</div>)}</div></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, title, content }: { icon: React.ComponentType<{ className?: string }>; title: string; content: React.ReactNode }) {
  return (
    <div className="rounded-[1.7rem] border border-boutique-brown/10 bg-[#fffaf3] p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-boutique-brown shadow-sm"><Icon className="h-4 w-4" /></div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-boutique-brown/60">{title}</h3>
      </div>
      <div>{content}</div>
    </div>
  );
}
