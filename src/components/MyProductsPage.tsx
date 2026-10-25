import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';
import { deleteProductImageFromStorage } from '../utils/imageUpload';
import { 
  Package, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ShoppingBag,
  Tag,
  MapPin,
  LogIn
} from 'lucide-react';

interface MyProductsPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth?: () => void;
}

export const MyProductsPage: React.FC<MyProductsPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCondition, setEditCondition] = useState<'New' | 'Used'>('Used');
  const [editLocation, setEditLocation] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch only user's products
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setProducts([]);
      return;
    }

    setLoading(true);
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('ownerUid', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as Product);
        });

        // Client-side sort by createdAt desc if index not ready
        items.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });

        setProducts(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user products:', error);
        setActionMessage({
          type: 'error',
          text: 'Failed to load your products. Please check connection.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Open Edit Modal
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.price.toString());
    setEditDescription(product.description || '');
    setEditCondition(product.condition === 'New' ? 'New' : 'Used');
    setEditLocation(product.location || 'Wukari, Taraba State');
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const numericPrice = parseFloat(editPrice.replace(/,/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid price in Naira.');
      return;
    }

    try {
      setSavingEdit(true);
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, {
        title: editTitle.trim(),
        price: numericPrice,
        description: editDescription.trim(),
        condition: editCondition,
        location: editLocation.trim(),
        updatedAt: serverTimestamp(),
      });

      setActionMessage({
        type: 'success',
        text: `Listing "${editTitle}" updated successfully!`,
      });
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Error updating product:', err);
      alert('Could not update listing: ' + (err?.message || 'Unknown error'));
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete product
  const handleDelete = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${product.title}"?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(product.id);

      // 1. Delete image from Storage if applicable
      if (product.imageUrl) {
        await deleteProductImageFromStorage(product.imageUrl);
      }
      if (Array.isArray(product.images)) {
        for (const imgUrl of product.images) {
          if (imgUrl !== product.imageUrl) {
            await deleteProductImageFromStorage(imgUrl);
          }
        }
      }

      // 2. Delete Firestore document
      await deleteDoc(doc(db, 'products', product.id));

      setActionMessage({
        type: 'success',
        text: `"${product.title}" has been deleted from NaijaMart.`,
      });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setActionMessage({
        type: 'error',
        text: 'Failed to delete listing: ' + (err?.message || 'Unknown error'),
      });
    } finally {
      setDeletingId(null);
    }
  };

  // If user not signed in
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-[#008751] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">My Posted Goods</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Sign in to view, edit, or remove the products you have posted on NaijaMart Hub.
          </p>
          <button
            onClick={() => onOpenAuth ? onOpenAuth() : onNavigate('market')}
            className="w-full bg-[#008751] hover:bg-[#007043] text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In to See Your Goods</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top Banner & Total Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#008751] text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5" /> Seller Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            My Posted Goods
          </h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">
            You have posted <span className="text-[#008751] font-black">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('sell')}
          className="bg-[#008751] hover:bg-[#007043] text-white py-3 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Item</span>
        </button>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div
          className={`mb-5 p-4 rounded-2xl flex items-center justify-between text-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#008751]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#008751] mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading your listings...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-[#008751] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            No products posted yet
          </h2>
          <p className="text-gray-600 max-w-md mx-auto text-sm mb-6 leading-relaxed">
            You haven't listed any items for sale yet. Turn your unused electronics, fashion, phones, or bedspaces into cash today!
          </p>
          <button
            onClick={() => onNavigate('sell')}
            className="inline-flex items-center gap-2 bg-[#008751] hover:bg-[#007043] text-white py-3.5 px-6 rounded-2xl font-black text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Your First Product</span>
          </button>
        </div>
      )}

      {/* Product List */}
      {!loading && products.length > 0 && (
        <div className="space-y-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Product preview */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {item.condition || 'Used'}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-bold text-[#008751] uppercase tracking-wider mb-0.5">
                    {item.category || 'Item'}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="text-base sm:text-lg font-black text-[#008751] mt-0.5">
                    {formatNaira(item.price)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {item.location || 'Wukari'}
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <button
                  onClick={() => handleStartEdit(item)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>

                <button
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
                Edit Listing
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-1">
                Update Product Details
              </h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Price in Naira (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCondition('Used')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                      editCondition === 'Used'
                        ? 'bg-[#008751] text-white border-[#008751]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Used
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCondition('New')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                      editCondition === 'New'
                        ? 'bg-[#008751] text-white border-[#008751]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Brand New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Location / Campus
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. FUWukari Campus, Taraba"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 px-4 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-black shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
