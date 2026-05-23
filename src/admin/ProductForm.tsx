import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ImageUploader } from './ImageUploader';
import { useStore } from '../store/useStore';
import { getAdminToken } from './adminAuth';

type UploadedImage = {
  url: string;
  id: string;
  publicId?: string;
};

type PromotionBadge = 'none' | 'featured' | 'newArrival' | 'bestseller';

const CLOUD_STYLES = [
  { label: 'Blue', image: '/product-card-cloud-blue.png' },
  { label: 'Peach', image: '/product-card-cloud-peach.png' },
  { label: 'Mint', image: '/product-card-cloud-mint.png' },
];

const TogglePill = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
    }`}
  >
    <span>{label}</span>
    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? 'bg-white/30' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </span>
  </button>
);

export const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { addProduct } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [promotionBadge, setPromotionBadge] = useState<PromotionBadge>('none');
  const [ageRange, setAgeRange] = useState('');
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [bgImage, setBgImage] = useState('/product-card-cloud-blue.png');
  const [personalizationRequired, setPersonalizationRequired] = useState(true);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const token = getAdminToken();
        const response = await fetch(`/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.details || data.error || 'Could not load product.');
        setName(data.name || '');
        setDescription(data.description || '');
        setPrice(String(data.price || ''));
        setSalePrice(data.salePrice ? String(data.salePrice) : '');
        setSku(data.sku || '');
        setStockQuantity(String(data.stockQuantity ?? 0));
        setStatus(data.status === 'draft' ? 'draft' : 'active');
        setPromotionBadge(data.bestseller ? 'bestseller' : data.newArrival ? 'newArrival' : data.featured ? 'featured' : 'none');
        setAgeRange(data.ageRange || '');
        setMaterial(data.material || '');
        setCareInstructions(data.careInstructions || '');
        setPreparationTime(data.preparationTime || '');
        setBgImage(data.bgImage || '/product-card-cloud-blue.png');
        setPersonalizationRequired(Boolean(data.personalizationRequired));
        setImages(data.imageUrl ? [{ url: data.imageUrl, publicId: data.publicId, id: data.id }] : []);
      } catch (error) {
        console.error(error);
        alert((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const productPreview = images[0] ? {
    id: id || 'new-product-preview',
    name: name.trim() || 'New personalized gift',
    description: description.trim() || 'Your uploaded product will appear inside the selected cloud card.',
    price: Number(price) || 0,
    imageUrl: images[0].url,
    bgImage,
    badge: promotionBadge === 'bestseller' ? 'Bestseller' : promotionBadge === 'newArrival' ? 'New' : undefined,
    personalizationRequired,
  } : null;

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !price || images.length === 0) {
      alert('Please fill product name, description, price and upload one image.');
      return;
    }
    setIsSaving(true);
    try {
      const token = getAdminToken();
      const response = await fetch(isEditing ? `/api/admin/products/${id}` : '/api/admin/products', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          imageUrl: images[0].url,
          publicId: images[0].publicId,
          bgImage,
          sku: sku.trim(),
          stockQuantity: Number(stockQuantity) || 0,
          status,
          featured: promotionBadge === 'featured',
          newArrival: promotionBadge === 'newArrival',
          bestseller: promotionBadge === 'bestseller',
          ageRange: ageRange.trim(),
          material: material.trim(),
          careInstructions: careInstructions.trim(),
          preparationTime: preparationTime.trim(),
          personalizationRequired,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Product save failed.');
      if (!isEditing) addProduct(data);
      alert(isEditing ? 'Product updated successfully.' : 'Product saved to database successfully.');
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-gray-500 font-medium">Loading product...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm mt-1">{isEditing ? 'Update this storefront product.' : 'Create a new product for the storefront.'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/products')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Discard</button>
          <button onClick={handleSave} disabled={isSaving} className="bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">{isSaving ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Product name" />
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Product description" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Media</h2>
            <ImageUploader images={images} onImagesChange={setImages} />
            {productPreview && <div className="mt-6 border-t border-gray-100 pt-6"><p className="mb-3 text-sm font-medium text-gray-700">Storefront card preview</p><div className="overflow-hidden rounded-xl border border-[#d4b497]/20 bg-boutique-bg bg-pattern bg-[length:280px_280px] px-3 py-5"><ProductCard product={productPreview} preview /></div></div>}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
            <h2 className="text-lg font-medium text-gray-900">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Price USD" />
              <input type="number" min="0" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Compare at price" />
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="SKU" />
              <input type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Stock quantity" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
            <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Age range" />
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Material" />
              <input type="text" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Preparation time" />
            </div>
            <textarea rows={3} value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Care instructions" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Organization</h2>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'draft')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"><option value="active">Active</option><option value="draft">Draft</option></select>
            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Promotion badge</p>
              <TogglePill active={promotionBadge === 'none'} label="None" onClick={() => setPromotionBadge('none')} />
              <TogglePill active={promotionBadge === 'featured'} label="Featured" onClick={() => setPromotionBadge('featured')} />
              <TogglePill active={promotionBadge === 'newArrival'} label="New arrival" onClick={() => setPromotionBadge('newArrival')} />
              <TogglePill active={promotionBadge === 'bestseller'} label="Bestseller" onClick={() => setPromotionBadge('bestseller')} />
            </div>
            <div className="grid grid-cols-3 gap-2">{CLOUD_STYLES.map((style) => <button key={style.image} type="button" onClick={() => setBgImage(style.image)} className={`rounded-lg border p-2 ${style.image === bgImage ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}><img src={style.image} className="aspect-[1.6/1] w-full object-fill" alt="" /><span className="mt-1 block text-center text-[11px] font-medium text-gray-700">{style.label}</span></button>)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between"><div><h2 className="font-medium text-gray-900 text-sm">Personalization</h2><p className="text-xs text-gray-500">Enable custom fields for this product.</p></div><button type="button" onClick={() => setPersonalizationRequired(!personalizationRequired)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${personalizationRequired ? 'bg-gray-900' : 'bg-gray-300'}`}><span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${personalizationRequired ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
        </div>
      </div>
    </div>
  );
};
