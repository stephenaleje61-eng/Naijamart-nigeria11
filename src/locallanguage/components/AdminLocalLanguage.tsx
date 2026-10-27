import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TranslationFeedback } from '../types';
import { 
  ShieldCheck, 
  Star, 
  Check, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Languages, 
  MessageSquare,
  Sparkles 
} from 'lucide-react';

export const AdminLocalLanguage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<TranslationFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const q = query(collection(db, 'feedbackLocal'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() } as TranslationFeedback)));
        setLoading(false);
      },
      (err) => {
        console.warn('Could not fetch feedbackLocal:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'reviewed' | 'resolved') => {
    try {
      await updateDoc(doc(db, 'feedbackLocal', id), { status });
    } catch (e: any) {
      alert('Error updating status: ' + e.message);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback entry?')) return;
    try {
      await deleteDoc(doc(db, 'feedbackLocal', id));
    } catch (e: any) {
      alert('Error deleting: ' + e.message);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (statusFilter === 'all') return true;
    return f.status === statusFilter;
  });

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Total Reviews</span>
            <Languages className="w-4 h-4 text-[#087443]" />
          </div>
          <p className="text-2xl font-black text-[#17231F]">{feedbacks.length}</p>
          <p className="text-[11px] text-gray-400">User accuracy assessments</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Average Accuracy</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-[#17231F]">{avgRating} / 5.0</p>
          <p className="text-[11px] text-gray-400">Based on user ratings</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Pending Reviews</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {feedbacks.filter(f => f.status === 'pending').length}
          </p>
          <p className="text-[11px] text-gray-400">Requiring linguist review</p>
        </div>
      </div>

      {/* Filter and List Container */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="font-black text-base text-[#17231F]">Translation Quality & Accuracy Reports</h3>
            <p className="text-xs text-gray-500">User feedback submitted from the translation workspace</p>
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'pending', 'reviewed', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-[#087443] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-gray-400">Loading feedback records...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-600">No feedback submissions found</p>
            <p className="text-[11px] text-gray-400">Feedback submitted from users will appear here for review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeedbacks.map((f) => (
              <div
                key={f.id}
                className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2 relative"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[#087443]">
                      {f.sourceLang} → {f.targetLang}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md capitalize">
                      {f.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center text-amber-500">
                      {[...Array(f.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    f.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : f.status === 'reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {f.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-400 block">Source Input:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{f.sourceText}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-400 block">System Output:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{f.translatedText}</p>
                  </div>
                </div>

                {f.feedbackText && (
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-amber-950 font-medium">
                    <span className="font-bold text-amber-900 block text-[10px]">User Feedback / Correction:</span>
                    <p className="mt-0.5">{f.feedbackText}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <span className="text-[10px] text-gray-400">
                    Submitted: {new Date(f.createdAt).toLocaleString()} {f.userEmail && `by ${f.userEmail}`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {f.status !== 'reviewed' && (
                      <button
                        onClick={() => f.id && handleUpdateStatus(f.id, 'reviewed')}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold text-blue-700"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {f.status !== 'resolved' && (
                      <button
                        onClick={() => f.id && handleUpdateStatus(f.id, 'resolved')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold text-[#087443]"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => f.id && handleDeleteFeedback(f.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
