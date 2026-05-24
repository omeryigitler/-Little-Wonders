import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, CheckCircle2, Package, RefreshCcw, Sparkles, Tag, Wand2 } from 'lucide-react';
import { Product } from '../store/useStore';
import { getAdminToken } from './adminAuth';

const GroupCard = ({ title, count, note, icon: Icon, to }: { title: string; count: number | string; note: string; icon: React.ComponentType<{ className?: string }>; to: string }) => (
  <Link to={to} className="group relative overflow-hidden rounded-[1.7rem] border border-boutique-brown/10 bg-white/82 p-5 shadow-[0_16px_40px_rgba(58,37,26,0.07)] transition-transform hover:-translate-y-0.5 backdrop-blur-sm">
    <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -right-8 -top-10 w-32 opacity-25 mix-blend-multiply" alt="" />
    <div className="relative z-10 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-boutique-brown/55">{title}</p>
        <p className="mt-4 font-serif text-4xl leading-none text-boutique-brown">{count}</p>
        <p className="mt-2 text-xs text-boutique-brown-light">{note}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4df] text-boutique-brown shadow-sm"><Icon className="h-5 w-5" /></div>
    </div>
    <div className="relative z-10 mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-boutique-brown/55 group-hover:text-boutique-brown">Manage products <ArrowRight className="h-3.5 w-3.5" /></div>
  </Link>
);

export const AdminCategories = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Could not load categories.');
      setProducts(data);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const stats = useMemo(() => {
    const active = products.filter((product) => (product.status || 'active') !== 'draft').length;
    const draft = products.filter((product) => product.status === 'draft').length;
    const featured = products.filter((product: any) => product.featured).length;
    const newArrival = products.filter((product: any) => product.newArrival).length;
    const bestseller = products.filter((product: any) => product.bestseller).length;
    const personalized = products.filter((product: any) => product.personalizationEnabled || product.personalizationFields?.length > 0 || product.personalizationRequired).length;
    return { active, draft, featured, newArrival, bestseller, personalized };
  }, [products]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-boutique-brown/10 bg-white/78 p-7 shadow-[0_20px_55px_rgba(58,37,26,0.08)] backdrop-blur-sm">
        <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute -right-12 -top-14 w-64 opacity-30 mix-blend-multiply" alt="" />
        <img src="/toy-wooden-star-solid.png" className="pointer-events-none absolute right-10 bottom-6 w-10 rotate-12 opacity-35 mix-blend-multiply" alt="" />
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-[#fffaf3] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-boutique-brown-light"><Sparkles className="h-4 w-4" /> Catalog groups</div>
            <h1 className="font-serif text-5xl leading-none text-boutique-brown">Categories</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-boutique-brown-light">Organize the storefront using product status, promotion badges, and personalization groups.</p>
          </div>
          <button onClick={loadProducts} disabled={isLoading} className="inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-white px-5 py-3 text-sm font-bold text-boutique-brown shadow-sm hover:bg-[#fff4df] disabled:opacity-50"><RefreshCcw className="h-4 w-4" /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <GroupCard title="Active Products" count={isLoading ? '—' : stats.active} note="Visible gifts in the storefront" icon={CheckCircle2} to="/admin/products" />
        <GroupCard title="Draft Products" count={isLoading ? '—' : stats.draft} note="Hidden products waiting for review" icon={Package} to="/admin/products" />
        <GroupCard title="Featured" count={isLoading ? '—' : stats.featured} note="Highlighted products" icon={Tag} to="/admin/products" />
        <GroupCard title="New Arrivals" count={isLoading ? '—' : stats.newArrival} note="Freshly promoted gifts" icon={Sparkles} to="/admin/products" />
        <GroupCard title="Bestsellers" count={isLoading ? '—' : stats.bestseller} note="Top promotional group" icon={Boxes} to="/admin/products" />
        <GroupCard title="Personalized" count={isLoading ? '—' : stats.personalized} note="Custom gift products" icon={Wand2} to="/admin/templates" />
      </div>

      <div className="rounded-[2rem] border border-boutique-brown/10 bg-white/82 p-6 shadow-[0_20px_55px_rgba(58,37,26,0.08)] backdrop-blur-sm">
        <h2 className="font-serif text-3xl text-boutique-brown">How categories work right now</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-boutique-brown-light">Little Wonders currently groups products by status and promotion badges instead of a separate category database. This keeps the storefront simple while the catalog is small. If you want real custom categories later, we can add a category table and assign products to collections.</p>
      </div>
    </div>
  );
};
