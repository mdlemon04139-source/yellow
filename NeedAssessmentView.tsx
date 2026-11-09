import React, { useState, useMemo } from 'react';
import { NeedAssessment, UpazilaName, Volunteer } from '../../types';
import { MYMENSINGH_UPAZILAS } from '../../types';
import {
  ClipboardList,
  ThumbsUp,
  Plus,
  CheckCircle2,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';

interface NeedAssessmentViewProps {
  needs: NeedAssessment[];
  currentUser: Volunteer | null;
  isAdmin: boolean;
  onAddNeed: (data: {
    title: string;
    description: string;
    category?: any;
    upazila?: UpazilaName | 'District';
  }) => Promise<void>;
  onVoteNeed: (needId: string) => Promise<void>;
  onFulfillNeed: (needId: string, adminNote?: string) => Promise<void>;
  onDeleteNeed: (needId: string) => Promise<void>;
  onOpenAuth: () => void;
}

const CATEGORIES = [
  'Disaster Relief',
  'Medical',
  'Education',
  'Environment',
  'Equipment',
  'Community Care',
  'General',
] as const;

export const NeedAssessmentView: React.FC<NeedAssessmentViewProps> = ({
  needs,
  currentUser,
  isAdmin,
  onAddNeed,
  onVoteNeed,
  onFulfillNeed,
  onDeleteNeed,
  onOpenAuth,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('General');
  const [upazila, setUpazila] = useState<UpazilaName | 'District'>('District');
  const [adminNotePromptId, setAdminNotePromptId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('All');

  // Split into Open Needs (sorted by votes descending) and Fulfilled Needs
  const openNeeds = useMemo(() => {
    return needs
      .filter((n) => n.status !== 'fulfilled')
      .filter((n) => selectedFilterCategory === 'All' || n.category === selectedFilterCategory)
      .sort((a, b) => b.votesCount - a.votesCount);
  }, [needs, selectedFilterCategory]);

  const fulfilledNeeds = useMemo(() => {
    return needs
      .filter((n) => n.status === 'fulfilled')
      .filter((n) => selectedFilterCategory === 'All' || n.category === selectedFilterCategory)
      .sort((a, b) => new Date(b.fulfilledAt || 0).getTime() - new Date(a.fulfilledAt || 0).getTime());
  }, [needs, selectedFilterCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    await onAddNeed({
      title: title.trim(),
      description: description.trim(),
      category,
      upazila,
    });

    setTitle('');
    setDescription('');
    setCategory('General');
    setUpazila('District');
    setIsModalOpen(false);
  };

  const handleFulfillConfirm = async (needId: string) => {
    await onFulfillNeed(needId, adminNoteInput.trim() || undefined);
    setAdminNotePromptId(null);
    setAdminNoteInput('');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner & Post Need Header - Compact & User Friendly */}
      <div className="bg-gradient-to-r from-[#065018] to-emerald-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-emerald-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 text-yellow-300 font-army font-black text-[11px] uppercase tracking-wider">
              <ClipboardList className="w-3.5 h-3.5 text-yellow-400" />
              <span>COMMUNITY FIELD NEED ASSESSMENT</span>
            </div>
            <h3 className="text-base sm:text-lg font-black font-army tracking-wide text-white leading-tight">
              GRASSROOTS NEEDS & DEMOCRATIC VOTING
            </h3>
            <p className="text-[11px] text-emerald-100 mt-0.5 max-w-lg">
              Submit community field requirements or rescue gear needs. Top-voted needs are prioritized.
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else setIsModalOpen(true);
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-army font-black text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase shrink-0 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Need</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedFilterCategory('All')}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedFilterCategory === 'All'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Needs ({needs.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilterCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedFilterCategory === cat
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 1. OPEN NEEDS (Sorted by Votes Descending) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-army font-black text-xs sm:text-sm uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>ACTIVE PROPOSALS (RANKED BY MOST VOTES)</span>
          </h4>
          <span className="text-xs font-bold text-slate-500">
            {openNeeds.length} Pending
          </span>
        </div>

        {openNeeds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-army font-black text-xs text-slate-400 uppercase">
              No active community needs submitted yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Be the first to post an assessment or field requirement!
            </p>
          </div>
        ) : (
          openNeeds.map((need, idx) => {
            const hasVoted = currentUser && need.voters?.includes(currentUser.id);
            const isTopVoted = idx === 0 && need.votesCount > 0;

            return (
              <div
                key={need.id}
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition relative shadow-xs ${
                  isTopVoted ? 'border-yellow-400 ring-2 ring-yellow-400/40' : 'border-slate-200'
                }`}
              >
                {/* Top Voted Badge */}
                {isTopVoted && (
                  <div className="inline-flex items-center gap-1 bg-yellow-400 text-slate-950 font-army font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>#1 Highest Priority Field Need</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Category & Upazila Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {need.category}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{need.upazila}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(need.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 font-army">
                      {need.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                      {need.description}
                    </p>

                    <div className="text-[11px] text-slate-400 mt-2">
                      Proposed by: <strong className="text-slate-700">{need.createdBy.name}</strong> ({need.createdBy.role} • {need.createdBy.upazila})
                    </div>
                  </div>

                  {/* Right Actions: Upvote Button + Admin Controls */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <button
                      onClick={() => onVoteNeed(need.id)}
                      className={`px-3.5 py-2 rounded-2xl font-army font-black text-xs flex items-center gap-1.5 cursor-pointer transition ${
                        hasVoted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white' : ''}`} />
                      <span>{need.votesCount} {need.votesCount === 1 ? 'Vote' : 'Votes'}</span>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          onClick={() => setAdminNotePromptId(need.id)}
                          title="Fulfill / Mark Completed"
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Fulfill</span>
                        </button>

                        <button
                          onClick={() => onDeleteNeed(need.id)}
                          title="Delete Assessment"
                          className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Admin Fulfill Prompt */}
                {adminNotePromptId === need.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-emerald-50/70 p-3 rounded-2xl">
                    <div className="text-xs font-bold text-emerald-900">
                      Mark as Done / Fulfilled by Yellow Army Leadership:
                    </div>
                    <input
                      type="text"
                      placeholder="Optional action summary (e.g. Distributed 50 life jackets via Red Crescent)..."
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-xl border border-emerald-300 bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFulfillConfirm(need.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-army font-black text-xs rounded-xl uppercase cursor-pointer"
                      >
                        Confirm Fulfilled
                      </button>
                      <button
                        onClick={() => setAdminNotePromptId(null)}
                        className="px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 2. FULFILLED / COMPLETED NEEDS SECTION */}
      {fulfilledNeeds.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-army font-black text-xs sm:text-sm uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>FULFILLED & ACTIONED ASSESSMENTS ({fulfilledNeeds.length})</span>
            </h4>
          </div>

          <div className="space-y-3">
            {fulfilledNeeds.map((need) => (
              <div
                key={need.id}
                className="bg-[#f7fdf9] rounded-3xl p-4 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>Fulfilled</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {need.upazila} • {need.category}
                    </span>
                  </div>
                  <h5 className="font-army font-black text-sm text-slate-900">
                    {need.title}
                  </h5>
                  {need.adminNote && (
                    <p className="text-xs text-emerald-800 mt-1 italic">
                      Outcome: "{need.adminNote}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Fulfilled on {new Date(need.fulfilledAt || '').toLocaleDateString()} {need.fulfilledBy ? `by ${need.fulfilledBy.name}` : ''} • Received {need.votesCount} community votes
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onFulfillNeed(need.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Reopen
                    </button>
                    <button
                      onClick={() => onDeleteNeed(need.id)}
                      className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Submit New Need Assessment */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 relative animate-fadeIn space-y-4"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <span className="bg-[#07531d] text-yellow-400 font-army font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                Field Assessment Submission
              </span>
              <h3 className="text-xl font-black font-army text-slate-900 mt-1">
                SUBMIT FIELD NEED PROPOSAL
              </h3>
              <p className="text-xs text-slate-500">
                Describe the specific requirement so volunteers and administrators can review, vote, and mobilize resources.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Need Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Life Jackets and Inflatable Rescue Boat for Dhobaura"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sector / Upazila
                  </label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="District">All District (Mymensingh)</option>
                    {MYMENSINGH_UPAZILAS.map((upz) => (
                      <option key={upz} value={upz}>
                        {upz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Detailed Field Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain why this need exists, estimated cost or required materials, target beneficiaries, and urgency..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#07531d] hover:bg-emerald-900 text-yellow-400 font-army font-black text-xs rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Publish Need
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
