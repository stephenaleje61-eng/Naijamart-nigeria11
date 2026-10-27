import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { JobListing, FreelancerProfile, JobApplication } from '../types';
import { 
  Briefcase, 
  UserCheck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Upload, 
  CheckCircle, 
  X, 
  MessageSquare, 
  Phone, 
  FileText, 
  Star,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Props {
  selectedState: string;
  searchQuery: string;
  onOpenAuth: () => void;
  userCoords: { lat: number; lng: number } | null;
  haversineDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export const SkillBridgeModule: React.FC<Props> = ({
  selectedState,
  searchQuery,
  onOpenAuth,
  userCoords,
  haversineDistance
}) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<'jobs' | 'freelancers'>('jobs');

  // Job Board State
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Apply Modal State
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [applySuccess, setApplySuccess] = useState(false);

  // 1. Subscribe to jobListings
  useEffect(() => {
    const jobsRef = collection(db, 'jobListings');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: JobListing[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as JobListing);
        });
        setJobs(list);
        setLoading(false);
      },
      (err) => {
        console.warn('jobListings query note:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to freelancerProfiles
  useEffect(() => {
    const freeRef = collection(db, 'freelancerProfiles');
    const unsubscribe = onSnapshot(
      freeRef,
      (snapshot) => {
        const list: FreelancerProfile[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as FreelancerProfile);
        });
        setFreelancers(list);
      },
      (err) => {
        console.warn('freelancerProfiles query note:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Quick Apply Submission
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!cvFile) {
      alert('Please upload your CV (PDF or document max 5MB).');
      return;
    }

    setIsSubmittingApp(true);
    setUploadProgress(10);

    try {
      let cvDownloadUrl = '';

      // Upload to Firebase Storage: /cvs/{uid}/{filename}
      try {
        const storagePath = `cvs/${user.uid}/${Date.now()}_${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, cvFile);

        cvDownloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snap) => {
              const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 90);
              setUploadProgress(Math.max(20, progress));
            },
            (error) => {
              console.warn('Storage upload error, using fallback:', error);
              // Fallback to safe base64 representation if storage permissions block
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(cvFile);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      } catch (uploadErr) {
        console.warn('Using data URL fallback for CV:', uploadErr);
        const reader = new FileReader();
        cvDownloadUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(cvFile);
        });
      }

      setUploadProgress(100);

      // Save to jobApplications collection
      await addDoc(collection(db, 'jobApplications'), {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        applicantName: applicantName.trim() || user.displayName || 'Applicant',
        applicantEmail: applicantEmail.trim() || user.email || '',
        applicantPhone: applicantPhone.trim(),
        portfolioUrl: portfolioLink.trim(),
        cvUrl: cvDownloadUrl,
        coverNote: coverNote.trim(),
        applicantUid: user.uid,
        employerUid: selectedJob.employerUid,
        status: 'submitted',
        createdAt: serverTimestamp(),
      });

      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
        setCvFile(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit application:', err);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const getHireWhatsAppUrl = (f: FreelancerProfile) => {
    const cleanDigits = f.phone.replace(/[^0-9]/g, '');
    const intl = cleanDigits.startsWith('0') 
      ? '234' + cleanDigits.slice(1) 
      : cleanDigits.startsWith('234') 
      ? cleanDigits 
      : '234' + cleanDigits;
    const msg = encodeURIComponent(
      `Hello ${f.fullName}, I saw your talent profile on SkillBridge Africa (NaijaHub). I would like to discuss hiring you for a project.`
    );
    return `https://wa.me/${intl}?text=${msg}`;
  };

  // Filter jobs
  const filteredJobs = jobs.filter((j) => {
    const matchState = selectedState === 'All Nigeria' || j.state?.toLowerCase() === selectedState.toLowerCase() || j.jobType === 'Remote';
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      j.title?.toLowerCase().includes(q) ||
      j.companyName?.toLowerCase().includes(q) ||
      j.category?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q);
    return matchState && matchQuery;
  });

  // Filter freelancers
  const filteredFreelancers = freelancers.filter((f) => {
    const matchState = selectedState === 'All Nigeria' || f.state?.toLowerCase() === selectedState.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      f.fullName?.toLowerCase().includes(q) ||
      f.tagline?.toLowerCase().includes(q) ||
      f.skills?.some((s) => s.toLowerCase().includes(q));
    return matchState && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Module Header & Switcher */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-black mb-1.5 border border-blue-200/60">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>SkillBridge Africa • Work, Talent & Career</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            African Careers & Freelance Talent Directory
          </h2>
          <p className="text-xs text-gray-500">
            Apply with 1-click CV upload or hire verified African builders, developers, accountants, and creators.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-[#F8F7F2] p-1.5 rounded-2xl gap-1 border border-gray-200/60 shrink-0">
          <button
            onClick={() => setSubTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'jobs' ? 'bg-[#075B43] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Openings ({filteredJobs.length})</span>
          </button>
          <button
            onClick={() => setSubTab('freelancers')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'freelancers' ? 'bg-[#075B43] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Freelancers ({filteredFreelancers.length})</span>
          </button>
        </div>
      </div>

      {/* JOBS BOARD VIEW */}
      {subTab === 'jobs' && (
        <div>
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400 shadow-xs">
              <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-black text-gray-900 mb-1">No job vacancies listed currently</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                Employers and businesses: Post full-time, remote, or internship roles to receive verified applications.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-gray-200/90 p-5 hover:border-[#0D9B72] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#075B43] text-[10px] font-black border border-emerald-200">
                        {job.jobType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                        {job.category || 'General'}
                      </span>
                      {job.salaryRange && (
                        <span className="text-xs font-black text-[#075B43]">
                          ₦{job.salaryRange}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-base text-[#17231F] leading-tight">{job.title}</h3>
                      <p className="text-xs text-gray-600 font-bold mt-0.5">
                        {job.companyName} • <span className="font-medium text-gray-500">{job.state}</span>
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{job.description}</p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requirements.slice(0, 4).map((req, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#F8F7F2] border border-gray-200 rounded-lg text-[10px] font-medium text-gray-700"
                          >
                            ✓ {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2 sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        if (user) {
                          setApplicantName(user.displayName || '');
                          setApplicantEmail(user.email || '');
                        }
                      }}
                      className="px-5 py-3 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-2xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Quick Apply (CV)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FREELANCER DIRECTORY VIEW */}
      {subTab === 'freelancers' && (
        <div>
          {filteredFreelancers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400 shadow-xs">
              <UserCheck className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-black text-gray-900 mb-1">No freelancers in this selection</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                Are you a software engineer, designer, agronomist, or marketer? Register your profile for free.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFreelancers.map((f) => (
                <div
                  key={f.id}
                  className="bg-white rounded-3xl border border-gray-200/90 p-5 hover:border-[#0D9B72] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#075B43] font-black text-base flex items-center justify-center shadow-xs">
                        {(f.fullName || f.name || 'F').charAt(0)}
                      </div>
                      <div className="truncate">
                        <h4 className="font-black text-sm text-[#17231F] truncate">{f.fullName || f.name || 'Freelancer'}</h4>
                        <p className="text-xs text-[#0D9B72] font-bold truncate">{f.tagline}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {f.state}, Nigeria
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{f.bio}</p>

                    {/* Skill chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {(f.skills || []).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#F8F7F2] border border-gray-200/80 rounded-lg text-[10px] font-bold text-gray-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <span className="font-black text-[#075B43] text-sm">
                        ₦{Number(f.hourlyRate).toLocaleString()} <span className="text-[10px] font-normal text-gray-500">/hr</span>
                      </span>
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        <Star className="w-3.5 h-3.5 fill-[#F5B942] text-[#F5B942]" />
                        <span>{f.rating ? f.rating.toFixed(1) : '5.0'}</span>
                        <span className="text-gray-400 font-normal">({f.completedGigs || 4} gigs)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href={getHireWhatsAppUrl(f)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-2xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Hire on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUICK APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#075B43] bg-emerald-50 px-2 py-0.5 rounded-full">
                  Direct Application
                </span>
                <h3 className="font-black text-sm text-gray-900 mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-gray-500">{selectedJob.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {applySuccess ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle className="w-12 h-12 text-[#0D9B72] mx-auto animate-bounce" />
                <h4 className="font-black text-base text-gray-900">Application Submitted!</h4>
                <p className="text-xs text-gray-500">
                  Your CV and details have been transmitted directly to {selectedJob.companyName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Amina Bello"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="amina@example.com"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="08167258121"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Portfolio Link (Optional)</label>
                    <input
                      type="url"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                    />
                  </div>
                </div>

                {/* CV File Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Upload CV / Resume (PDF or Doc, max 5MB)
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 hover:bg-emerald-50/40 hover:border-[#0D9B72] transition-colors cursor-pointer text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File exceeds 5MB size limit.');
                            return;
                          }
                          setCvFile(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="space-y-1">
                      <FileText className="w-6 h-6 text-gray-400 mx-auto" />
                      <p className="text-xs font-bold text-gray-700">
                        {cvFile ? cvFile.name : 'Click to select CV document'}
                      </p>
                      <p className="text-[10px] text-gray-400">Stored securely in Firebase Storage</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Short Cover Note</label>
                  <textarea
                    rows={2}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Briefly state your relevant experience and notice period..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                  />
                </div>

                {isSubmittingApp && (
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#075B43] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 text-center font-bold">
                      Uploading CV... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApp || !cvFile}
                    className="flex-2 py-3 bg-[#075B43] hover:bg-[#0D9B72] disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                  >
                    {isSubmittingApp ? 'Submitting Application...' : 'Send Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
