import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { PersonalizationModal } from './components/PersonalizationModal';
import { useStore } from './store/useStore';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const {
    products,
    loadProducts,
    productsLoading,
    openPersonalizationModal,
    addToCart,
    openCart,
  } = useStore();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const product = useMemo(() => {
    return products.find((item) => item.slug === slug || item.id === slug);
  }, [products, slug]);

  const handlePrimaryAction = () => {
    if (!product) return;

    if (product.personalizationRequired) {
      openPersonalizationModal(product);
      return;
    }

    addToCart({
      product,
      quantity: 1,
      personalizationData: {},
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-boutique-bg font-sans text-boutique-brown relative overflow-x-hidden">
      <CartDrawer />
      <PersonalizationModal />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-pattern bg-[length:400px_400px]"></div>

      <header className="relative z-20 flex items-center justify-between border-b border-boutique-brown/10 bg-boutique-bg/80 px-6 py-5 backdrop-blur-md md:px-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-boutique-brown-light hover:text-boutique-brown">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
        <Link to="/" className="font-serif text-3xl text-boutique-brown">Little Wonders</Link>
        <button onClick={openCart} className="p-2 text-boutique-brown hover:text-boutique-wood">
          <ShoppingBag size={22} strokeWidth={1.5} />
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:py-16">
        {productsLoading && <p className="text-center text-boutique-brown-light">Loading product...</p>}

        {!productsLoading && !product && (
          <div className="mx-auto max-w-xl rounded-3xl border border-boutique-brown/10 bg-white/70 p-10 text-center shadow-sm">
            <h1 className="font-serif text-4xl text-boutique-brown">Product not found</h1>
            <p className="mt-3 text-boutique-brown-light">This item may be unavailable or still in draft.</p>
            <Link to="/" className="mt-6 inline-flex rounded-full bg-boutique-brown px-5 py-3 text-sm font-bold text-white">
              Return to shop
            </Link>
          </div>
        )}

        {product && (
          <div className="grid gap-10 md:grid-cols-[48%_52%] md:items-center">
            <div className="relative rounded-[2rem] border border-boutique-brown/10 bg-white/60 p-8 shadow-sm">
              <img src={product.bgImage || '/product-card-cloud-blue.png'} className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] object-fill opacity-40" alt="" />
              <div className="relative mx-auto flex aspect-square max-w-[460px] items-center justify-center rounded-[2rem] bg-white/40">
                <img src={product.imageUrl} className="max-h-[82%] max-w-[82%] object-contain drop-shadow-xl" alt={product.name} />
                {product.badge && (
                  <span className="absolute right-6 top-6 rounded-full border border-[#d4b497]/30 bg-[#fdfaf6] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#3a251a] shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            <section className="rounded-[2rem] border border-boutique-brown/10 bg-white/70 p-8 shadow-sm md:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-boutique-bg px-4 py-2 text-xs font-bold uppercase tracking-wider text-boutique-brown-light">
                <Sparkles className="h-4 w-4" /> Handmade in the USA
              </div>

              <h1 className="font-serif text-4xl leading-tight text-boutique-brown md:text-5xl">{product.name}</h1>
              <p className="mt-5 text-lg leading-relaxed text-boutique-brown-light">{product.description}</p>

              <div className="mt-6 flex items-end gap-3">
                <p className="text-3xl font-bold text-boutique-brown">${product.price.toFixed(2)}</p>
                {product.salePrice && <p className="pb-1 text-lg text-boutique-brown-light line-through">${product.salePrice.toFixed(2)}</p>}
              </div>

              <div className="mt-8 grid gap-3 text-sm text-boutique-brown-light sm:grid-cols-2">
                {product.material && <InfoCard label="Material" value={product.material} />}
                {product.ageRange && <InfoCard label="Age Range" value={product.ageRange} />}
                {product.preparationTime && <InfoCard label="Preparation" value={product.preparationTime} />}
                {typeof product.stockQuantity === 'number' && <InfoCard label="Availability" value={product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Made to order'} />}
              </div>

              {product.careInstructions && (
                <div className="mt-6 rounded-2xl bg-boutique-bg/80 p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-boutique-brown">Care Instructions</h2>
                  <p className="mt-2 text-sm leading-relaxed text-boutique-brown-light">{product.careInstructions}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handlePrimaryAction}
                className="mt-8 w-full rounded-full bg-boutique-brown px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-boutique-wood"
              >
                {product.personalizationRequired ? 'Personalize This Gift' : 'Add to Cart'}
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-boutique-brown/10 bg-white/70 p-4">
    <p className="text-[11px] font-bold uppercase tracking-wider text-boutique-brown/60">{label}</p>
    <p className="mt-1 font-medium text-boutique-brown">{value}</p>
  </div>
);
