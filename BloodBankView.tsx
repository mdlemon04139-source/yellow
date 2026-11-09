import React, { useMemo } from 'react';
import { Volunteer, BloodGroup } from '../../types';
import { VolunteerCard } from './VolunteerCard';
import { Droplet, ArrowLeft, PhoneCall, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

interface BloodBankViewProps {
  volunteers: Volunteer[];
  selectedBlood: BloodGroup | 'All';
  onSelectBlood: (bg: BloodGroup | 'All') => void;
  onSelectVolunteer: (vol: Volunteer) => void;
  isAdmin: boolean;
  onDeleteVolunteer?: (id: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BloodBankView: React.FC<BloodBankViewProps> = ({
  volunteers,
  selectedBlood,
  onSelectBlood,
  onSelectVolunteer,
  isAdmin,
  onDeleteVolunteer,
}) => {
  // Only volunteers who agreed to donate blood (isBloodDonor !== false)
  const activeDonors = useMemo(() => {
    return volunteers.filter((v) => v.isBloodDonor !== false);
  }, [volunteers]);

  // Blood counts based strictly on willing donors
  const bloodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BLOOD_GROUPS.forEach((bg) => {
      counts[bg] = activeDonors.filter((v) => v.bloodGroup === bg).length;
    });
    return counts;
  }, [activeDonors]);

  // Average donor count across all groups to dynamically determine Ready vs Rare
  const avgDonorCount = useMemo(() => {
    const values = Object.values(bloodCounts) as number[];
    const sum = values.reduce((a, b) => a + b, 0);
    return values.length > 0 ? sum / values.length : 1;
  }, [bloodCounts]);

  const filteredDonors = useMemo(() => {
    if (selectedBlood === 'All') return activeDonors;
    return activeDonors.filter((v) => v.bloodGroup === selectedBlood);
  }, [activeDonors, selectedBlood]);

  // Check if donor is eligible (donated >= 3 months ago or never)
  const checkDonationEligibility = (lastDate?: string) => {
    if (!lastDate) return { ready: true, text: 'Ready to donate' };
    const last = new Date(lastDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays < 90) {
      const remainingDays = 90 - diffDays;
      return {
        ready: false,
        text: 'Not ready for donate',
        detail: `Donated ${diffDays} days ago (${remainingDays} days rest remaining)`,
      };
    }
    return {
      ready: true,
      text: 'Ready to donate',
      detail: `Last donated ${diffDays} days ago`,
    };
  };

  // 1. Grid of Blood Groups (When no specific blood group is selected)
  if (selectedBlood === 'All') {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Emergency Alert Banner - Compact & User Friendly */}
        <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 text-white rounded-3xl p-4 sm:p-5 shadow-xs border border-red-500">
          <div className="flex items-center gap-2 mb-0.5 text-yellow-300 font-army font-black text-xs uppercase tracking-wider">
            <Droplet className="w-4 h-4 text-yellow-300 fill-current" />
            <span>BLOOD DONOR DIRECTORY</span>
          </div>
          <h3 className="text-base sm:text-lg font-black font-army tracking-wide text-white">
            SELECT BLOOD GROUP FOR INSTANT 1-TAP CALL
          </h3>
          <p className="text-xs text-rose-100 mt-0.5 max-w-xl">
            Mymensingh Yellow Army Lifesaver Blood Network • Instant 1-tap contact with active volunteer donors.
          </p>
        </div>

        {/* 8 Blood Groups Grid - DYNAMIC READY / RARE BASED ON DONOR COUNT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BLOOD_GROUPS.map((bg) => {
            const count = bloodCounts[bg] || 0;
            // More donors = Ready, fewer donors = Rare
            const isRare = count < 2 || count < avgDonorCount;

            return (
              <div
                key={bg}
                onClick={() => onSelectBlood(bg)}
                className="bg-white hover:bg-rose-50/40 rounded-2xl p-2.5 sm:p-3 border border-slate-200 hover:border-red-400 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-7 h-7 rounded-xl bg-rose-50 text-red-600 font-black flex items-center justify-center text-xs group-hover:bg-red-600 group-hover:text-white transition">
                      <Droplet className="w-3.5 h-3.5 fill-current" />
                    </span>
                    {isRare ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        Rare
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                  <h4 className="font-army font-black text-xl sm:text-2xl text-slate-900 group-hover:text-red-600 transition leading-none">
                    {bg}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {count} Verified {count === 1 ? 'Donor' : 'Donors'}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black italic uppercase text-red-600">
                  <span className="flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>Call Donors</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Filtered Blood Group Donor List with direct calling
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Back Button & Header */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => onSelectBlood('All')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Blood Groups</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-black">
              🩸
            </span>
            <h3 className="text-base sm:text-lg font-black font-army text-slate-900 uppercase">
              {selectedBlood} Blood Donors ({filteredDonors.length})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-rose-50 border border-rose-300 text-red-700 font-army font-black text-xs px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>
              {filteredDonors.filter((v) => checkDonationEligibility(v.lastBloodDonationDate).ready).length} Eligible Donors
            </span>
          </span>
        </div>
      </div>

      {/* Emergency Hotline Guidance */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2 font-medium">
        <PhoneCall className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Click the <strong>green phone icon</strong> next to any donor to place a direct call. Donors who donated within 3 months will display a <strong>"not ready for donate"</strong> note.
        </span>
      </div>

      {/* Donors List */}
      <div className="space-y-3">
        {filteredDonors.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6">
            <Droplet className="w-8 h-8 text-rose-300 mx-auto mb-2" />
            <p className="font-army font-black text-xs text-slate-400 uppercase tracking-wider">
              No registered donors for blood group {selectedBlood} yet
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Update your profile blood group to be listed as a donor!
            </p>
          </div>
        ) : (
          filteredDonors.map((vol) => {
            const eligibility = checkDonationEligibility(vol.lastBloodDonationDate);

            return (
              <div key={vol.id} className="space-y-1">
                <VolunteerCard
                  volunteer={vol}
                  onSelect={onSelectVolunteer}
                  isAdmin={isAdmin}
                  onDelete={onDeleteVolunteer}
                />
                {/* Last Donation Date & Eligibility Note */}
                <div className="flex items-center justify-between px-3 text-[11px]">
                  <span className="text-slate-500 font-medium">
                    Last Donated:{' '}
                    <strong className="text-slate-700">
                      {vol.lastBloodDonationDate || 'Not recorded / Never'}
                    </strong>
                  </span>
                  {!eligibility.ready ? (
                    <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-black text-[10px] uppercase">
                      ⚠️ {eligibility.text} ({eligibility.detail})
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      ✓ {eligibility.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
