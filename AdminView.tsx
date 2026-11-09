import React, { useState } from 'react';
import { useApp, isPermanentAdminEmail } from '../../context/AppContext';
import {
  ShieldCheck,
  Shield,
  UserCheck,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle,
  PlusCircle,
  Edit3,
  UserPlus,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';
import { Volunteer, AdminRole, UpazilaName, BloodGroup, VBDRole, MYMENSINGH_UPAZILAS } from '../../types';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    volunteers,
    updateVolunteerRole,
    updateVolunteerDetails,
    approveRoleRequest,
    declineRoleRequest,
    adminUpdateVolunteerRole,
    removeVolunteer,
    isAdmin,
    triggerConfetti,
    ensureVolunteersLoaded,
  } = useApp();

  // Lazy-load complete volunteer roster only when Admin is opened
  React.useEffect(() => {
    if (isAdmin) {
      ensureVolunteersLoaded();
    }
  }, [isAdmin, ensureVolunteersLoaded]);

  const [councilSearch, setCouncilSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedUserForRemoval, setSelectedUserForRemoval] = useState<Volunteer | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center animate-fadeIn">
        <div className="bg-white rounded-[32px] border-2 border-slate-200 p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black italic uppercase text-slate-900">
            ADMINISTRATOR PRIVILEGES REQUIRED
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            You must have District Coordinator or Super Admin credentials to access the Yellow Army Admin Control Center.
          </p>
        </div>
      </div>
    );
  }

  // Pending Role Approvals (Board Member and Alumni)
  const pendingApprovals = volunteers.filter((v) => {
    if (!v.pendingRole) return false;
    const pr = v.pendingRole.trim().toLowerCase();
    return pr === 'board member' || pr === 'alumni';
  });

  // Council members: Admins and Moderators
  const councilMembers = volunteers.filter((v) => {
    const isProtected = isPermanentAdminEmail(v.email);
    const hasRole =
      v.adminRole === 'Super Admin' ||
      v.adminRole === 'District Coordinator' ||
      v.adminRole === 'Moderator';
    return isProtected || hasRole;
  });

  const filteredCouncil = councilMembers.filter((v) => {
    const q = councilSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.volunteerIdCode.toLowerCase().includes(q) ||
      v.upazila.toLowerCase().includes(q)
    );
  });

  // Non-council candidates for appointing
  const eligibleCandidates = volunteers.filter((v) => {
    const isProtected = isPermanentAdminEmail(v.email);
    const hasRole =
      v.adminRole === 'Super Admin' ||
      v.adminRole === 'District Coordinator' ||
      v.adminRole === 'Moderator';
    if (isProtected || hasRole) return false;
    const q = candidateSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.volunteerIdCode.toLowerCase().includes(q) ||
      v.upazila.toLowerCase().includes(q)
    );
  });

  const handleRoleChange = async (vol: Volunteer, newRole: AdminRole) => {
    if (isPermanentAdminEmail(vol.email)) {
      alert(`This email (${vol.email}) is a permanent root administrator and can never be removed or demoted.`);
      return;
    }
    await updateVolunteerRole(vol.id, newRole);
    showToast(`Updated ${vol.fullName}'s role to ${newRole}`);
  };

  const handleRemoveFromCouncil = async (vol: Volunteer) => {
    if (isPermanentAdminEmail(vol.email)) {
      alert(`This email (${vol.email}) is a permanent root administrator and cannot be removed.`);
      return;
    }
    await updateVolunteerRole(vol.id, 'General Member');
    showToast(`Removed ${vol.fullName} from Admin/Moderator council.`);
    setSelectedUserForRemoval(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#065018] text-yellow-300 border-2 border-emerald-400 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black italic uppercase animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full bg-[#07531d]"></div>
          <div className="bg-white border border-slate-200 px-5 py-1.5 rounded-full shadow-2xs">
            <span className="text-xs font-black italic uppercase tracking-widest text-slate-700">
              ADMIN & MODERATOR COUNCIL
            </span>
          </div>
        </div>

        <span className="bg-[#07531d] text-yellow-400 text-[10px] font-black italic uppercase px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SUPER ADMIN AUTHORIZED</span>
        </span>
      </div>

      {/* PENDING APPROVAL SECTION */}
      <div id="admin-role-approvals" className="bg-white rounded-[32px] border-2 border-amber-300 p-5 sm:p-6 shadow-sm space-y-3 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
            <h3 className="font-black italic uppercase text-slate-900 text-sm sm:text-base tracking-wider">
              PENDING APPROVAL ({pendingApprovals.length})
            </h3>
          </div>
          {pendingApprovals.length > 0 && (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-300">
              Approval Required
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          When a volunteer selects "Board Member" or "Alumni" during registration or in their profile, an administrative approval is required.
        </p>

        {pendingApprovals.length === 0 ? (
          <div className="py-4 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            No pending role approvals at this time. All volunteer roles are verified.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {pendingApprovals.map((vol) => {
              const reqRole = vol.pendingRole || 'Board Member';
              return (
                <div
                  key={vol.id}
                  className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={vol.avatarUrl}
                      alt={vol.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 text-sm break-words leading-tight">{vol.fullName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {vol.upazila} • {vol.volunteerIdCode}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          Current: {vol.roleInVBD || 'General Member'}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold">➔</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-black border border-emerald-300">
                          Requested: {reqRole}{vol.pendingBoardType ? ` (${vol.pendingBoardType})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                    <button
                      onClick={() => {
                        approveRoleRequest(vol.id);
                        showToast(`Approved ${vol.fullName} as ${reqRole}${vol.pendingBoardType ? ` (${vol.pendingBoardType})` : ''}!`);
                      }}
                      className="flex-1 py-2 bg-[#053712] hover:bg-[#07471b] text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve {reqRole}</span>
                    </button>
                    <button
                      onClick={() => {
                        declineRoleRequest(vol.id);
                        showToast(`Declined request for ${vol.fullName}`);
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Decline / Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 1: Active Admin & Moderator Council */}
      <div className="bg-white rounded-[32px] border-2 border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black italic uppercase text-slate-900 text-sm sm:text-base tracking-wider">
                CURRENT COUNCIL MEMBERS ({filteredCouncil.length})
              </h3>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {councilMembers.filter((c) => c.adminRole === 'Super Admin' || c.adminRole === 'District Coordinator' || isPermanentAdminEmail(c.email)).length} Admins • {councilMembers.filter((c) => c.adminRole === 'Moderator').length} Moderators
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">
              Authorized personnel with administration and publishing permissions
            </p>
          </div>

          {/* Search Council */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search council..."
              value={councilSearch}
              onChange={(e) => setCouncilSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Council Member Cards */}
        {filteredCouncil.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-black italic uppercase text-slate-500">
            No council members found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCouncil.map((vol, idx) => {
              const isPermanent = isPermanentAdminEmail(vol.email);
              const isFullAdmin =
                isPermanent ||
                vol.adminRole === 'Super Admin' ||
                vol.adminRole === 'District Coordinator';
              const isMod = vol.adminRole === 'Moderator';

              return (
                <div
                  key={vol.id ? `${vol.id}-${idx}` : `cvol-${idx}`}
                  className={`border rounded-2xl p-4 transition shadow-2xs relative flex flex-col justify-between ${
                    isPermanent
                      ? 'bg-amber-50/60 border-amber-300'
                      : isFullAdmin
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-blue-50/40 border-blue-200'
                  }`}
                >
                  <div>
                    {/* Header with Avatar and Badges */}
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={vol.avatarUrl}
                          alt={vol.fullName}
                          className={`w-11 h-11 rounded-2xl object-cover shrink-0 border-2 ${
                            isPermanent
                              ? 'border-amber-500 ring-2 ring-amber-300'
                              : isFullAdmin
                              ? 'border-[#07531d]'
                              : 'border-blue-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <h4 className="font-black italic uppercase text-xs sm:text-sm text-slate-900 truncate">
                            {vol.fullName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold truncate mt-0.5">
                            <span>{vol.volunteerIdCode}</span>
                            <span>•</span>
                            <span>{vol.upazila}</span>
                            <span>•</span>
                            <span className="text-rose-600 font-black">{vol.bloodGroup}</span>
                          </div>
                        </div>
                      </div>

                      {/* Role Pill */}
                      {isPermanent ? (
                        <span className="bg-amber-500 text-slate-900 text-[9px] font-black italic uppercase px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 shadow-2xs">
                          <Lock className="w-3 h-3" />
                          <span>ROOT ADMIN</span>
                        </span>
                      ) : isFullAdmin ? (
                        <span className="bg-[#07531d] text-yellow-400 text-[9px] font-black italic uppercase px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 shadow-2xs">
                          <ShieldCheck className="w-3 h-3" />
                          <span>ADMIN</span>
                        </span>
                      ) : (
                        <span className="bg-blue-700 text-white text-[9px] font-black italic uppercase px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 shadow-2xs">
                          <UserCheck className="w-3 h-3" />
                          <span>MODERATOR</span>
                        </span>
                      )}
                    </div>

                    {/* Contact info and role in VBD */}
                    <div className="bg-white/80 rounded-xl p-2.5 text-[11px] text-slate-600 space-y-1 mb-3 border border-slate-200/60">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-400 uppercase">Email:</span>
                        <span className="font-medium truncate max-w-[180px]">{vol.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-400 uppercase">Mobile:</span>
                        <span className="font-medium">{vol.mobileNo}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-400 uppercase">VBD Rank:</span>
                        <span className="font-bold">
                          {vol.roleInVBD === 'Board Member' ? (
                            vol.boardType === 'District Board' ? (
                              <span className="bg-[#053712] text-white px-2 py-0.5 rounded text-[10px] font-black border border-emerald-700">
                                District Board
                              </span>
                            ) : (
                              <span className="bg-yellow-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black border border-yellow-500">
                                Upazila Board
                              </span>
                            )
                          ) : (
                            <span className="text-emerald-800">{vol.roleInVBD}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                    {isPermanent ? (
                      <span className="text-[10px] text-amber-800 font-bold italic">
                        Permanent Protected Account
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {isMod ? (
                          <button
                            onClick={() => handleRoleChange(vol, 'District Coordinator')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black italic uppercase transition cursor-pointer shadow-2xs"
                          >
                            Promote to Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(vol, 'Moderator')}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black italic uppercase transition cursor-pointer shadow-2xs"
                          >
                            Set as Moderator
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedUserForRemoval(vol)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-black italic uppercase transition cursor-pointer"
                          title="Demote to General Member"
                        >
                          Demote
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Appoint New Admin or Moderator */}
      <div className="bg-white rounded-[32px] border-2 border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black italic uppercase text-slate-900 text-sm sm:text-base tracking-wider">
                APPOINT NEW ADMIN OR MODERATOR
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">
              Promote general volunteers to give them administrative or publishing authority
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search member by name, ID..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Candidate List: Search Only */}
        {!candidateSearch.trim() ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-500">
            Type a volunteer's name, email, or ID code in the search bar above to appoint them.
          </div>
        ) : eligibleCandidates.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-black italic uppercase text-slate-500">
            No volunteers found matching "{candidateSearch}".
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {eligibleCandidates.map((vol, idx) => (
              <div
                key={vol.id ? `${vol.id}-${idx}` : `cand-${idx}`}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={vol.avatarUrl}
                    alt={vol.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-black italic uppercase text-xs text-slate-900 break-words leading-tight">
                      {vol.fullName}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                      <span>{vol.volunteerIdCode}</span>
                      <span>•</span>
                      <span>{vol.upazila}</span>
                      <span>•</span>
                      <span className="text-slate-700">{vol.roleInVBD}</span>
                    </div>
                  </div>
                </div>

                {/* Appoint Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRoleChange(vol, 'Moderator')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-[10px] font-black italic uppercase transition cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3 text-blue-600" />
                    <span>Make Moderator</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange(vol, 'District Coordinator')}
                    className="px-3 py-1.5 bg-[#053712] hover:bg-[#07471b] text-yellow-400 border border-emerald-600 rounded-xl text-[10px] font-black italic uppercase transition cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-yellow-400" />
                    <span>Make Admin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demotion Confirmation Modal */}
      {selectedUserForRemoval && (
        <div
          onClick={() => setSelectedUserForRemoval(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] shadow-2xl p-6 text-slate-900 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-black italic uppercase text-base text-slate-900">
              REMOVE FROM COUNCIL?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Are you sure you want to demote <strong>{selectedUserForRemoval.fullName}</strong> back to General Member? They will lose admin/moderator capabilities.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setSelectedUserForRemoval(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveFromCouncil(selectedUserForRemoval)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black italic uppercase rounded-full text-xs transition shadow-xs cursor-pointer"
              >
                Confirm Demotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
