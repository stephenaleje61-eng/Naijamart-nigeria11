import React from 'react';
import { X, Users } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { ChatView } from './ChatView';

export const FriendsModal: React.FC = () => {
  const { isFriendsModalOpen, setIsFriendsModalOpen } = useStudent();

  if (!isFriendsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#008751] via-emerald-600 to-[#049b5d] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base">Student Network & Real-Time Chats</h2>
                <span className="bg-yellow-400 text-black text-[9px] px-2 py-0.2 rounded-full font-black uppercase">
                  100% Real
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                Live friend requests, acceptance, and private chats across Nigerian universities
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFriendsModalOpen(false)}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded ChatView */}
        <div className="overflow-y-auto flex-1">
          <ChatView isModal={true} />
        </div>
      </div>
    </div>
  );
};
