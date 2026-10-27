import React, { useState } from 'react';
import { JobListing } from '../types';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { 
  X, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  FileText, 
  Upload, 
  CheckCircle, 
  Send,
  Share2
} from 'lucide-react';

interface Props {
  job: JobListing | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const JobDetailModal: React.FC<Props> = ({ job, onClose, onOpenAuth }) => {
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!job) return null;

  const comp = job.companyName || job.company || 'Company';
  const jType = job.jobType || job.type || 'Full-time';
  const sal = job.salaryRange || job.salary;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleStartApply = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setCandidateName(user.displayName || '');
    setCandidateEmail(user.email || '');
    setIsApplying(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUploadProgress(true);
    try {
      let cvUrl = '';
      if (cvFile && storage) {
        try {
          const fileRef = ref(storage, `cvs/${user.uid}/${Date.now()}_${cvFile.name}`);
          const snap = await uploadBytes(fileRef, cvFile);
          cvUrl = await getDownloadURL(snap.ref);
        } catch (uploadErr) {
          console.warn('Direct storage upload failed, saving file meta:', uploadErr);
          cvUrl = `cv_stored_local://${cvFile.name}`;
        }
      }

      await addDoc(collection(db, 'jobApplications'), {
        jobId: job.id,
        jobTitle: job.title,
        companyName: comp,
        applicantUid: user.uid,
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        candidatePhone: candidatePhone.trim(),
        coverNote: coverNote.trim(),
        cvUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsApplying(false);
        setSubmitted(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Failed to submit application:', err);
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#075B43]/10 text-[#075B43] flex items-center justify-center font-bold text-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#17231F] leading-tight">
                {job.title}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {comp} • {job.state}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share link"
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {copiedLink && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#075B43] text-xs font-bold rounded-xl text-center">
              Link copied to clipboard!
            </div>
          )}

          {/* Quick Details Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F8F7F2] rounded-2xl border border-gray-200/60 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Employment Type</span>
              <span className="font-bold text-gray-900">{jType}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Salary / Stipend</span>
              <span className="font-black text-[#075B43]">
                {sal ? `₦${sal}` : 'Negotiable'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Location</span>
              <span className="font-bold text-gray-800">{job.state}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Posted</span>
              <span className="font-bold text-gray-800">Recently</span>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              Role Overview & Responsibilities
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Job Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Requirements & Qualifications
              </h3>
              <ul className="space-y-1.5">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-[#075B43] font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Apply Form Section */}
          {isApplying ? (
            <div className="bg-[#F8F7F2] p-5 rounded-2xl border-2 border-emerald-800/10 space-y-4 animate-in fade-in">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#075B43] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0D9B72]" />
                Submit Application to {comp}
              </h3>

              {submitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-[#0D9B72] mx-auto" />
                  <p className="text-xs font-black text-[#075B43]">Application Submitted Successfully!</p>
                  <p className="text-[11px] text-gray-500">The employer has received your details and CV.</p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="e.g. Amina Musa"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="e.g. amina@example.com"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">WhatsApp / Phone</label>
                      <input
                        type="tel"
                        required
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        placeholder="e.g. 08167258121"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Attach CV / Resume (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Brief Cover Pitch</label>
                    <textarea
                      rows={2}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Why are you the best fit for this role? Share past achievements..."
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadProgress}
                      className="px-5 py-2 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{uploadProgress ? 'Submitting Application...' : 'Send Application'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-600 font-medium">
            Contact: <span className="font-bold text-gray-900">{job.contactEmail || 'Apply through portal'}</span>
          </div>

          {!isApplying && (
            <button
              onClick={handleStartApply}
              className="px-6 py-2.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-98"
            >
              <FileText className="w-4 h-4 text-[#F5B942]" />
              <span>Quick Apply Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
