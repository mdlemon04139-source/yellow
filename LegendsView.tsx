import React from 'react';
import { Volunteer } from '../../types';
import { Shield, Sparkles, Phone, Droplet, Crown, HeartHandshake } from 'lucide-react';

interface LegendsViewProps {
  volunteers: Volunteer[];
  onSelectVolunteer: (vol: Volunteer) => void;
  isAdmin: boolean;
  onDeleteVolunteer?: (id: string) => void;
}

export const LegendsView: React.FC<LegendsViewProps> = ({
  volunteers,
  onSelectVolunteer,
  isAdmin,
  onDeleteVolunteer,
}) => {
  // Filter only Alumni
  const alumniList = volunteers.filter(
    (v) => v.roleInVBD === 'Alumni' || v.status === 'alumni'
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner: Golden Hall of Legends */}
      <div className="bg-gradient-to-r from-slate-950 via-[#1c1917] to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-yellow-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-yellow-400 font-army font-black text-xs uppercase tracking-widest">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>THE HALL OF IMMORTAL GUARDIANS</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-army tracking-wide text-white">
              HONORING OUR IMMORTAL LEGENDS
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Honoring the venerable veterans and foundational pillars whose selfless sacrifice, dedication, and tireless humanitarian service built the legacy of Mymensingh Yellow Army. Their leadership and enduring spirit remain our perpetual inspiration.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="bg-yellow-400/20 border border-yellow-400 text-yellow-300 font-army font-black text-xs px-4 py-2 rounded-full uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>{alumniList.length} Immortal Legends</span>
            </span>
          </div>
        </div>
      </div>

      {/* Legends Cards List */}
      <div className="space-y-4">
        {alumniList.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <HeartHandshake className="w-12 h-12 text-yellow-500/50 mx-auto mb-2" />
            <h4 className="font-army font-black text-sm text-slate-700 uppercase">
              No Registered Alumni Found Yet
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Volunteers who selected 'Alumni' during registration are preserved in this immortal hall of honor.
            </p>
          </div>
        ) : (
          alumniList.map((alumnus) => (
            <div
              key={alumnus.id}
              onClick={() => onSelectVolunteer(alumnus)}
              className="bg-white rounded-3xl border-2 border-yellow-400/60 hover:border-yellow-500 shadow-sm hover:shadow-md transition p-4 sm:p-5 cursor-pointer relative group overflow-hidden"
            >
              {/* Top Accent Gold Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500"></div>

              {/* Volunteer Details Header */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {/* Left: Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={alumnus.avatarUrl}
                    alt={alumnus.fullName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-yellow-400 shadow-xs"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center text-[10px] shadow-2xs">
                    👑
                  </span>
                </div>

                {/* Center: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4
                      title={alumnus.fullName}
                      className="font-army italic font-black text-sm sm:text-base text-slate-950 uppercase truncate whitespace-nowrap leading-snug group-hover:text-amber-800 transition block max-w-full"
                    >
                      {alumnus.fullName}
                    </h4>
                    <span className="bg-yellow-400 text-slate-950 font-army font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-2xs shrink-0">
                      ALUMNI VETERAN
                    </span>
                    <Shield className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400/20 shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 uppercase">
                      Sector: {alumnus.upazila}
                    </span>
                    <span>•</span>
                    <span className="text-red-600 font-bold flex items-center gap-0.5">
                      <Droplet className="w-3 h-3 fill-current text-red-600" />
                      <span>{alumnus.bloodGroup}</span>
                    </span>
                    {alumnus.profession && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500 truncate max-w-[150px]">
                          {alumnus.profession}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Direct Call Button */}
                <div className="shrink-0 flex items-center gap-2">
                  {alumnus.mobileNo && (
                    <a
                      href={`tel:${alumnus.mobileNo}`}
                      onClick={(e) => e.stopPropagation()}
                      title={`Direct Call: ${alumnus.fullName} (${alumnus.mobileNo})`}
                      className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs hover:shadow transition active:scale-95 shrink-0 cursor-pointer"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                    </a>
                  )}
                </div>
              </div>

              {/* THE IMMORTAL LEGEND CARD (Requested by User) */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-yellow-300/80 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-army font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span className="bg-yellow-400 text-slate-950 px-2 py-0.5 rounded text-[10px]">
                      THE IMMORTAL LEGEND
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed mt-0.5">
                    "{alumnus.emergencyContactName ? alumnus.emergencyContactName : 'Foundational vanguard — an immovable pillar of selfless humanitarian service and sacrifice. Your leadership is permanently etched in the annals of Mymensingh Yellow Army.'}"
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
