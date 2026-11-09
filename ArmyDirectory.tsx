import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Users,
  MapPin,
  Droplet,
  Shield,
  ClipboardList,
  Award,
  UserPlus,
  X,
} from 'lucide-react';
import { Volunteer, BloodGroup, UpazilaName } from '../../types';
import { VolunteerCard } from './VolunteerCard';
import { ZoneView } from './ZoneView';
import { BloodBankView } from './BloodBankView';
import { HeroesView } from './HeroesView';
import { NeedAssessmentView } from './NeedAssessmentView';
import { LegendsView } from './LegendsView';

type SubTab = 'all' | 'zone' | 'blood' | 'heroes' | 'need' | 'legends';

export const ArmyDirectory: React.FC = () => {
  const {
    volunteers,
    currentUser,
    openAuthModal,
    deleteVolunteer,
    awardOrDeductPoints,
    needAssessments,
    addNeedAssessment,
    voteNeedAssessment,
    fulfillNeedAssessment,
    deleteNeedAssessment,
    boardPhotos,
    updateBoardPhoto,
    isAdmin,
    ensureVolunteersLoaded,
    ensureNeedAssessmentsLoaded,
    ensureBoardPhotosLoaded,
    openVolunteerProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SubTab>('all');

  // Lazy-load volunteers when Army Directory is opened
  React.useEffect(() => {
    ensureVolunteersLoaded();
  }, [ensureVolunteersLoaded]);

  // Lazy-load Need Assessments only when the 'need' subtab is opened
  React.useEffect(() => {
    if (activeTab === 'need') {
      ensureNeedAssessmentsLoaded();
    }
  }, [activeTab, ensureNeedAssessmentsLoaded]);

  // Lazy-load Board Photos only when the 'zone' subtab is opened
  React.useEffect(() => {
    if (activeTab === 'zone') {
      ensureBoardPhotosLoaded();
    }
  }, [activeTab, ensureBoardPhotosLoaded]);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<UpazilaName | 'All'>('All');
  const [selectedBlood, setSelectedBlood] = useState<BloodGroup | 'All'>('All');

  // Filter volunteers for "All Volunteers" tab
  const filteredAllVolunteers = useMemo(() => {
    return volunteers.filter((vol) => {
      // Exclude pure alumni from active command list if desired, or show all
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = vol.fullName.toLowerCase().includes(q);
        const matchEmail = vol.email.toLowerCase().includes(q);
        const matchPhone = vol.mobileNo.includes(q);
        const matchId = vol.volunteerIdCode?.toLowerCase().includes(q);
        const matchUpz = vol.upazila.toLowerCase().includes(q);
        const matchRole = vol.roleInVBD?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchId && !matchUpz && !matchRole) {
          return false;
        }
      }
      return true;
    });
  }, [volunteers, search]);

  const handleDeleteVolunteer = async (id: string) => {
    await deleteVolunteer(id);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 2-LINE SUB-TAB NAVIGATION (Strictly matching user requirements) */}
      <div className="space-y-2">
        {/* LINE 1: All Volunteers | Zone | Blood Bank */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* 1. All Volunteers */}
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedZone('All');
              setSelectedBlood('All');
            }}
            className={`w-full py-2.5 sm:py-3 px-2 rounded-2xl font-army italic font-black uppercase text-[11px] sm:text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
              activeTab === 'all'
                ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-500 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-yellow-50/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">All Volunteers</span>
          </button>

          {/* 2. Zone */}
          <button
            onClick={() => {
              setActiveTab('zone');
              setSelectedZone('All');
            }}
            className={`w-full py-2.5 sm:py-3 px-2 rounded-2xl font-army italic font-black uppercase text-[11px] sm:text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
              activeTab === 'zone'
                ? 'bg-blue-600 text-white ring-2 ring-blue-700 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span className="truncate">Zone</span>
          </button>

          {/* 3. Blood Bank */}
          <button
            onClick={() => {
              setActiveTab('blood');
              setSelectedBlood('All');
            }}
            className={`w-full py-2.5 sm:py-3 px-2 rounded-2xl font-army italic font-black uppercase text-[11px] sm:text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
              activeTab === 'blood'
                ? 'bg-rose-600 text-white ring-2 ring-rose-700 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50/50'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 shrink-0 fill-red-500 text-red-500" />
            <span className="truncate">Blood Bank</span>
          </button>
        </div>

        {/* LINE 2: Heros | Need Assessment | Legends */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* 4. Heros */}
          <button
            onClick={() => setActiveTab('heroes')}
            className={`w-full py-2.5 sm:py-3 px-2 rounded-2xl font-army italic font-black uppercase text-[11px] sm:text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
              activeTab === 'heroes'
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-600 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span className="truncate">Heros</span>
          </button>

          {/* 5. Need Assessment */}
          <button
            onClick={() => setActiveTab('need')}
            className={`w-full py-2.5 sm:py-3 px-2 rounded-2xl font-army italic font-black uppercase text-[11px] sm:text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
              activeTab === 'need'
                ? 'bg-[#065018] text-white ring-2 ring-[#07531d] shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50/50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
            <span className="truncate">Need Assessment</span>
          </button>

          {/* 6. Legends */}
          <button
            onClick={() => setActiveTab('legends')}
            className={`w-full py-2.5 sm:py-3 px-2 rounded-2xl font-army italic font-black uppercase text-[11px] sm:text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
              activeTab === 'legends'
                ? 'bg-slate-900 text-yellow-400 ring-2 ring-black shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0 text-yellow-500" />
            <span className="truncate">Legends</span>
          </button>
        </div>
      </div>

      {/* VIEW RENDERER BASED ON ACTIVE SUB-TAB */}
      {activeTab === 'all' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Pill-Shaped Command Personnel Search Bar */}
          <div className="relative">
            <div className="bg-white rounded-full border border-slate-200 shadow-xs px-5 py-3 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="SEARCH ALL VOLUNTEERS BY NAME, UPAZILA, MOBILE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none font-army uppercase text-xs sm:text-sm tracking-wider"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Header row: ACTIVE AGENTS + Count Pill */}
          <div className="flex items-center justify-between px-1 pt-1">
            <h3 className="font-army italic font-black uppercase text-xs sm:text-sm tracking-widest text-slate-600">
              ACTIVE AGENTS
            </h3>
            <span className="bg-white border border-emerald-300 text-[#07531d] font-army italic font-black text-[11px] px-3 py-0.5 rounded-full shadow-2xs uppercase">
              {filteredAllVolunteers.length} PEOPLE
            </span>
          </div>

          {/* Volunteer List Cards */}
          <div className="space-y-3">
            {filteredAllVolunteers.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <p className="font-army italic font-black text-xs text-slate-400 uppercase tracking-wider">
                  NO VOLUNTEERS FOUND FOR THIS QUERY
                </p>
              </div>
            ) : (
              filteredAllVolunteers.map((vol) => (
                <VolunteerCard
                  key={vol.id}
                  volunteer={vol}
                  onSelect={(v) => openVolunteerProfile(v)}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteVolunteer}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'zone' && (
        <ZoneView
          volunteers={volunteers}
          selectedZone={selectedZone}
          onSelectZone={(zone) => setSelectedZone(zone)}
          onSelectVolunteer={(vol) => openVolunteerProfile(vol)}
          isAdmin={isAdmin}
          onDeleteVolunteer={handleDeleteVolunteer}
          boardPhotos={boardPhotos}
          onUpdateBoardPhoto={updateBoardPhoto}
        />
      )}

      {activeTab === 'blood' && (
        <BloodBankView
          volunteers={volunteers}
          selectedBlood={selectedBlood}
          onSelectBlood={(bg) => setSelectedBlood(bg)}
          onSelectVolunteer={(vol) => openVolunteerProfile(vol)}
          isAdmin={isAdmin}
          onDeleteVolunteer={handleDeleteVolunteer}
        />
      )}

      {activeTab === 'heroes' && (
        <HeroesView
          volunteers={volunteers}
          onSelectVolunteer={(vol) => openVolunteerProfile(vol)}
          isAdmin={isAdmin}
          onDeleteVolunteer={handleDeleteVolunteer}
          boardPhotos={boardPhotos}
          onUpdateBoardPhoto={updateBoardPhoto}
        />
      )}

      {activeTab === 'need' && (
        <NeedAssessmentView
          needs={needAssessments}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onAddNeed={addNeedAssessment}
          onVoteNeed={voteNeedAssessment}
          onFulfillNeed={fulfillNeedAssessment}
          onDeleteNeed={deleteNeedAssessment}
          onOpenAuth={() => openAuthModal('login')}
        />
      )}

      {activeTab === 'legends' && (
        <LegendsView
          volunteers={volunteers}
          onSelectVolunteer={(vol) => openVolunteerProfile(vol)}
          isAdmin={isAdmin}
          onDeleteVolunteer={handleDeleteVolunteer}
        />
      )}
    </div>
  );
};
