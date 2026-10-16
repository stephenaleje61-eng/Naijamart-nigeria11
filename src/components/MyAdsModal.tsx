import React from 'react';
import { X, Package, Trash2, ExternalLink, PlusCircle } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

interface MyAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  myProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenPublish: () => void;
  onAdDeleted: (deletedId: string) => void;
}

export const MyAdsModal: React.FC<MyAdsModalProps> = ({
  isOpen,
  onClose,
  myProducts,
  onSelectProduct,
  onOpenPublish,
  onAdDeleted,
}) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleDelete = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing from NaijaMart?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      onAdDeleted(productId);
      showToast('Ad listing deleted successfully', 'info');
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast('Could not delete ad. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#008751] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-white" />
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">My Published Ads</h2>
              <p className="text-xs text-emerald-100">
                Managed on this device ({myProducts.length} live {myProducts.length === 1 ? 'ad' : 'ads'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ads List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {myProducts.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">No Ads Posted Yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-5">
                Post an Okada, phone, generator, car or fashion item right now. No signup or card required.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenPublish();
                }}
                className="bg-[#008751] hover:bg-[#007043] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 mx-auto shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Ad Free</span>
              </button>
            </div>
          ) : (
            myProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3 hover:shadow-xs transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.imageUrl}
                    alt={prod.title}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      ACTIVE • 7-DAY AD
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate mt-0.5">
                      {prod.title}
                    </h4>
                    <p className="text-xs font-black text-[#008751] mt-0.5">{formatNaira(prod.price)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {prod.location} • {formatTimeAgo(prod.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleDelete(prod.id, e)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
          <span className="text-gray-500 text-[11px]">Listings auto-expire after 7 days</span>
          <button
            onClick={() => {
              onClose();
              onOpenPublish();
            }}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold px-4 py-1.5 rounded-lg text-xs"
          >
            + Post Another Ad
          </button>
        </div>
      </div>
    </div>
  );
};
