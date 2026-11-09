import React, { useState } from 'react';
import { Volunteer } from '../../types';
import { Droplet, Phone, Trash2 } from 'lucide-react';
import { calculateVolunteerLevel } from '../../utils/gamification';
import { useApp } from '../../context/AppContext';
import { isUserCustomPhoto, inMemoryImageStore } from '../../utils/storageAndImage';
import { getCartoonYellowAvatar } from '../../utils/avatarUtils';

interface VolunteerCardProps {
  volunteer: Volunteer;
  onSelect: (vol: Volunteer) => void;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  hideDhp?: boolean;
  rank?: number;
}

export const VolunteerCard: React.FC<VolunteerCardProps> = ({
  volunteer,
  onSelect,
  isAdmin,
  onDelete,
  hideDhp = false,
  rank,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Derive role abbreviation strictly according to user rules:
  // General Member -> "GM"
  // Committee Member -> "CM"
  // Board Member -> "BM - DIS" (District Board) / "BM - UPZ" (Upazila Board)
  // Alumni -> "AL"
  // DC -> "DC", SA -> "SA"
  const getRoleCode = (vol: Volunteer) => {
    if (vol.roleInVBD === 'Board Member') {
      return vol.boardType === 'District Board' ? 'BM - DIS' : 'BM - UPZ';
    }
    if (vol.roleInVBD === 'Committee Member') return 'CM';
    if (vol.roleInVBD === 'Alumni') return 'AL';
    if (vol.adminRole === 'District Coordinator') return 'DC';
    if (vol.adminRole === 'Super Admin') return 'SA';
    return 'GM';
  };

  const getRoleBadgeStyle = (vol: Volunteer) => {
    if (vol.roleInVBD === 'Board Member') {
      return vol.boardType === 'District Board'
        ? 'bg-[#053712] text-white border border-[#07531d]'
        : 'bg-yellow-400 text-slate-950 border border-yellow-500';
    }
    if (vol.roleInVBD === 'Committee Member') {
      return 'bg-yellow-400 text-slate-950 border border-yellow-500';
    }
    if (vol.roleInVBD === 'Alumni') {
      return 'bg-black text-yellow-400 border border-slate-700';
    }
    if (vol.adminRole === 'District Coordinator' || vol.adminRole === 'Super Admin') {
      return 'bg-[#053712] text-white border border-[#07531d]';
    }
    return 'bg-slate-200 text-slate-800';
  };

  const { currentUser } = useApp();
  const currentXp =
    typeof volunteer.xp === 'number'
      ? volunteer.xp
      : typeof volunteer.volunteeringScore === 'number'
      ? volunteer.volunteeringScore
      : 0;
  const currentDhp =
    typeof volunteer.dhp === 'number'
      ? volunteer.dhp
      : typeof volunteer.dhpPoints === 'number'
      ? volunteer.dhpPoints
      : 0;
  const levelInfo = calculateVolunteerLevel(currentXp);
  const roleCode = getRoleCode(volunteer);
  const isMe =
    !!currentUser &&
    (volunteer.id === currentUser.id ||
      (!!volunteer.email &&
        !!currentUser.email &&
        volunteer.email.toLowerCase() === currentUser.email.toLowerCase()));
  const memoryPhotos =
    inMemoryImageStore.get(volunteer.id) ||
    inMemoryImageStore.get((volunteer.email || '').toLowerCase());

  const displayAvatar =
    (isMe && isUserCustomPhoto(currentUser?.avatarUrl) ? currentUser!.avatarUrl : null) ||
    (isUserCustomPhoto(volunteer.avatarUrl) ? volunteer.avatarUrl : null) ||
    (isUserCustomPhoto(memoryPhotos?.avatarUrl) ? memoryPhotos!.avatarUrl : null) ||
    (isMe && currentUser?.avatarUrl ? currentUser.avatarUrl : null) ||
    volunteer.avatarUrl ||
    getCartoonYellowAvatar(volunteer.gender, volunteer.fullName);

  return (
    <div
      onClick={() => onSelect(volunteer)}
      className="bg-white rounded-[22px] sm:rounded-[24px] p-2.5 sm:p-3 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md card-interactive flex items-center gap-3 cursor-pointer group relative"
    >
      {/* Left: Avatar with online dot & optional Rank badge */}
      <div className="relative shrink-0">
        <img
          src={displayAvatar}
          onError={(e) => {
            const fallback = getCartoonYellowAvatar(volunteer.gender, volunteer.fullName);
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
          alt={volunteer.fullName}
          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover border-2 shadow-xs ${
            rank === 1
              ? 'border-yellow-400 ring-2 ring-yellow-300'
              : rank === 2
              ? 'border-slate-300 ring-2 ring-slate-200'
              : rank === 3
              ? 'border-amber-600 ring-2 ring-amber-400'
              : 'border-slate-100'
          }`}
        />
        {rank !== undefined && (
          <span
            className={`absolute -top-1 -left-1 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full font-army italic font-black text-[10px] sm:text-xs flex items-center justify-center shadow-xs border border-white ${
              rank === 1
                ? 'bg-yellow-400 text-slate-950'
                : rank === 2
                ? 'bg-slate-200 text-slate-800'
                : rank === 3
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            {rank}
          </span>
        )}
        {volunteer.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      {/* Center Column: 3 Clean Rows */}
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5 sm:space-y-1">
        {/* ROW 1: Full Name (Single Line) */}
        <div className="min-w-0">
          <h4
            title={volunteer.fullName}
            className="font-army italic font-black text-xs sm:text-sm text-slate-900 uppercase truncate whitespace-nowrap leading-tight group-hover:text-emerald-800 transition block w-full"
          >
            {volunteer.fullName}
          </h4>
        </div>

        {/* ROW 2: Upazila */}
        <div className="min-w-0">
          <span className="font-army italic font-black text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider leading-none block truncate">
            {volunteer.upazila}
          </span>
        </div>

        {/* ROW 3: VBD Role Short Form + Level + Blood Group */}
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none pt-0.5">
          {/* Role Pill */}
          <span
            className={`font-army font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-2xs tracking-wider shrink-0 ${getRoleBadgeStyle(
              volunteer
            )}`}
          >
            {roleCode}
          </span>

          {/* Level Pill */}
          {!hideDhp && (
            <span className="bg-black text-white font-army font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-2xs tracking-wider shrink-0">
              {levelInfo.levelCode}
            </span>
          )}

          {/* Blood Group */}
          <span className="text-[10px] sm:text-[11px] font-black text-red-600 flex items-center gap-0.5 font-mono shrink-0">
            <Droplet className="w-2.5 h-2.5 fill-red-600 text-red-600 shrink-0" />
            <span>{volunteer.bloodGroup}</span>
          </span>
        </div>
      </div>

      {/* Right Column: Actions (Call & Delete) on top, DHP & XP Badges beneath */}
      <div className="shrink-0 flex flex-col items-end justify-between self-stretch gap-1 min-w-[68px] sm:min-w-[76px]">
        {/* Top: Direct Call Button + Admin Delete Button */}
        <div className="flex items-center gap-1.5">
          {volunteer.mobileNo && (
            <a
              href={`tel:${volunteer.mobileNo}`}
              onClick={(e) => e.stopPropagation()}
              title={`Direct Call: ${volunteer.fullName} (${volunteer.mobileNo})`}
              className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#053712] hover:bg-[#07471b] text-white flex items-center justify-center shadow-2xs hover:shadow-xs transition cursor-pointer active:scale-95 shrink-0"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
            </a>
          )}

          {isAdmin && onDelete && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative inline-flex items-center"
            >
              {deleteConfirm ? (
                <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded-lg shadow-xs animate-fadeIn">
                  <button
                    onClick={() => onDelete(volunteer.id)}
                    className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold transition cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-1 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px] font-bold transition cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Remove Volunteer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom (Under delete button): DHP & XP Badges */}
        <div className="flex items-center gap-1">
          <div className="bg-[#f4fbf6] border border-emerald-200/80 rounded-md sm:rounded-lg px-1.5 py-0.5 text-center min-w-[30px] sm:min-w-[34px] shadow-2xs">
            <div className="font-army italic font-black text-[10px] sm:text-[11px] text-[#0c6b29] leading-tight">
              {currentXp}
            </div>
            <div className="text-[6.5px] sm:text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none">
              XP
            </div>
          </div>

          {!hideDhp && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-md sm:rounded-lg px-1.5 py-0.5 text-center min-w-[30px] sm:min-w-[34px] shadow-2xs">
              <div className="font-army italic font-black text-[10px] sm:text-[11px] text-amber-900 leading-tight">
                {currentDhp}
              </div>
              <div className="text-[6.5px] sm:text-[7px] font-black text-amber-600/80 uppercase tracking-wider leading-none">
                DHP
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
