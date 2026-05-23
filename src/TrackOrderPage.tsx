import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, PackageCheck, Search, ShoppingBag, Truck } from 'lucide-react';

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
  { key: 'processing', label: 'Processing', icon: Clock3 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
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
      <div className="fixed inset-0 pointer-events-none z-0 opacity-45 bg-pattern bg-[length:400px_400px]"></div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.92)_0%,rgba(252,250,246,0.55)_34%,rgba(252,250,246,0)_72%)]"></div>

      <header className="relative z-20 flex items-center justify-between border-b border-boutique-brown/10 bg-boutique-bg/85 px-6 py-5 backdrop-blur-md md:px-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-boutique-brown-light hover:text-boutique-brown">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
        <Link to="/" className="font-serif text-3xl text-boutique-brown">Little Wonders</Link>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-boutique-brown-light">
          <PackageCheck className="h-4 w-4" /> Order tracking
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-10 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-wider text-boutique-brown-light">
            <ShoppingBag className="h-4 w-4" /> Track your gift
          </div>
          <h1 className="font-serif text-5xl text-boutique-brown md:text-6xl">Order Tracking</h1>
          <p className="mt-4 text-boutique-brown-light">
            Enter your Little Wonders order reference to see the latest status and tracking details.
          </p>
        </div>

        <form onSubmit={handleTrack} className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-[2rem] border border-boutique-brown/10 bg-white/75 p-4 shadow-sm sm:flex-row">
          <input
            value={orderReference}
            onChange={(event) => setOrderReference(event.target.value)}
            className="min-h-14 flex-1 rounded-full border border-boutique-brown/10 bg-boutique-bg px-5 text-sm font-semibold uppercase tracking-wide outline-none focus:ring-2 focus:ring-boutique-wood/40"
            placeholder="LW-XXXXXXXX-XXXXX"
          />
          <button disabled={isLoading} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-boutique-brown px-6 text-sm font-bold text-white shadow-sm hover:bg-boutique-wood disabled:opacity-50">
            <Search className="h-4 w-4" /> {isLoading ? 'Checking...' : 'Track Order'}
          </button>
        </form>

        {errorMessage && (
          <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {order && (
          <section className="mt-10 overflow-hidden rounded-[2.2rem] border border-boutique-brown/10 bg-white/80 shadow-[0_24px_70px_rgba(58,37,26,0.10)] backdrop-blur-sm">
            <div className="border-b border-boutique-brown/10 bg-[#fffaf3] p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-boutique-brown/60">Order Reference</p>
                  <h2 className="mt-1 font-serif text-3xl text-boutique-brown">{order.orderNumber}</h2>
                  <p className="mt-2 text-sm text-boutique-brown-light">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-5 py-4 text-sm shadow-sm">
                  <p className="font-bold text-boutique-brown">${order.totalAmount.toFixed(2)}</p>
                  <p className="text-boutique-brown-light">Payment: {order.paymentStatus}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {order.orderStatus === 'cancelled' ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {STATUS_STEPS.map((step) => {
                    const Icon = step.icon;
                    const state = getStepState(order.orderStatus, step.key);
                    return (
                      <div key={step.key} className={`rounded-2xl border p-5 ${state === 'complete' ? 'border-green-200 bg-green-50 text-green-800' : 'border-boutique-brown/10 bg-boutique-bg text-boutique-brown-light'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${state === 'complete' ? 'bg-green-100' : 'bg-white'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold">{step.label}</p>
                            <p className="text-xs opacity-75">{state === 'complete' ? 'Completed' : 'Pending'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-boutique-brown/10 bg-boutique-bg/70 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-boutique-brown/60">Shipping</h3>
                  <p className="mt-2 font-medium text-boutique-brown">{order.customerName}</p>
                  <p className="text-sm text-boutique-brown-light">{order.customerEmail}</p>
                  {(order.shippingCity || order.shippingState) && <p className="mt-2 text-sm text-boutique-brown-light">{order.shippingCity}, {order.shippingState}</p>}
                </div>
                <div className="rounded-2xl border border-boutique-brown/10 bg-boutique-bg/70 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-boutique-brown/60">Tracking Reference</h3>
                  <p className="mt-2 font-bold text-boutique-brown">{order.trackingReference || 'Not added yet'}</p>
                  <p className="mt-1 text-sm text-boutique-brown-light">Tracking will appear here after the order ships.</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-boutique-brown/60">Items</h3>
                <div className="mt-3 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={`${item.productName}-${index}`} className="rounded-2xl border border-boutique-brown/10 bg-white p-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-serif text-lg font-medium text-boutique-brown">{item.productName}</p>
                          <p className="text-sm text-boutique-brown-light">Qty {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-bold text-boutique-brown">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                      {Object.keys(item.personalizationData).length > 0 && (
                        <div className="mt-3 rounded-xl bg-boutique-bg p-3 text-xs text-boutique-brown-light">
                          {Object.entries(item.personalizationData).map(([key, value]) => <div key={key}><span className="font-bold text-boutique-brown">{key}: </span>{String(value)}</div>)}
                        </div>
                      )}
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
