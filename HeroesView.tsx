import React, { useState, useMemo } from 'react';
import { Volunteer, UpazilaName } from '../../types';
import { VolunteerCard } from './VolunteerCard';
import { MYMENSINGH_UPAZILAS } from '../../types';
import { Trophy, Award, Flame, Filter } from 'lucide-react';
import { getDhpSeasonCountdown } from '../../utils/gamification';

interface HeroesViewProps {
  volunteers: Volunteer[];
  onSelectVolunteer: (vol: Volunteer) => void;
  isAdmin: boolean;
  onDeleteVolunteer?: (id: string) => void;
  boardPhotos?: any;
  onUpdateBoardPhoto?: any;
}

export const HeroesView: React.FC<HeroesViewProps> = ({
  volunteers,
  onSelectVolunteer,
  isAdmin,
  onDeleteVolunteer,
}) => {
  const [selectedUpazila, setSelectedUpazila] = useState<UpazilaName | 'All'>('All');
  const seasonInfo = useMemo(() => getDhpSeasonCountdown(), []);

  // Ranking logic: STRICTLY sorted by highest DHP score down to lowest!
  const rankedVolunteers = useMemo(() => {
    return [...volunteers]
      .filter((v) => v.roleInVBD !== 'Alumni' && v.status !== 'alumni')
      .filter((v) => selectedUpazila === 'All' || v.upazila === selectedUpazila)
      .sort((a, b) => {
        const dhpA = a.dhp ?? a.dhpPoints ?? 0;
        const dhpB = b.dhp ?? b.dhpPoints ?? 0;
        if (dhpB !== dhpA) {
          return dhpB - dhpA;
        }
        // Secondary tiebreaker: Lifetime XP
        const xpA = a.xp ?? a.volunteeringScore ?? 0;
        const xpB = b.xp ?? b.volunteeringScore ?? 0;
        return xpB - xpA;
      });
  }, [volunteers, selectedUpazila]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. COMPACT OFFICIAL DHP LEADERBOARD BANNER */}
      <div className="bg-gradient-to-r from-[#053712] via-[#07471b] to-[#04280d] text-white rounded-3xl p-4 sm:p-5 shadow-xs border border-emerald-600/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-yellow-300 font-army font-black text-xs uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span>OFFICIAL DHP LEADERBOARD</span>
            </div>
            <p className="text-[11px] text-emerald-100 max-w-xl font-medium">
              Ranked by District Heroes Points (DHP) • {seasonInfo.seasonName}
            </p>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-black/40 border border-emerald-500/50 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3 h-3 text-yellow-400" />
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value as any)}
                className="bg-transparent text-white text-xs font-army font-black uppercase focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All 13 Upazilas</option>
                {MYMENSINGH_UPAZILAS.map((upz) => (
                  <option key={upz} value={upz} className="bg-slate-900 text-white">
                    {upz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE RANKINGS LIST */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-army italic font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-emerald-700" />
            <span>Rankings ({rankedVolunteers.length})</span>
          </span>
        </div>

        {rankedVolunteers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6">
            <p className="font-army font-black text-xs text-slate-400 uppercase">
              No ranked volunteers found in this selection
            </p>
          </div>
        ) : (
          rankedVolunteers.map((vol, index) => {
            const rank = index + 1;

            return (
              <div key={vol.id} className="relative">
                <div className="rounded-[24px]">
                  <VolunteerCard
                    volunteer={vol}
                    onSelect={onSelectVolunteer}
                    isAdmin={isAdmin}
                    onDelete={onDeleteVolunteer}
                    rank={rank}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
