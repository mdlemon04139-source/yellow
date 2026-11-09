import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Clock,
  Heart,
  TreePine,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { MYMENSINGH_UPAZILAS, UPAZILA_BENGALI_NAMES } from '../../types';

export const AnalysisView: React.FC = () => {
  const { volunteers, projects, stats } = useApp();

  // Sector breakdown
  const upazilaDistribution = MYMENSINGH_UPAZILAS.map((upz) => {
    const vCount = volunteers.filter((v) => v.upazila === upz).length;
    const pCount = projects.filter((p) => p.upazilaScope === upz).length;
    return {
      name: upz,
      bengali: UPAZILA_BENGALI_NAMES[upz],
      volunteers: vCount,
      projects: pCount,
    };
  }).sort((a, b) => b.volunteers - a.volunteers);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full bg-[#07531d]"></div>
          <div className="bg-white border border-slate-200 px-5 py-1.5 rounded-full shadow-2xs">
            <span className="text-xs font-black italic uppercase tracking-widest text-slate-700">
              DISTRICT IMPACT ANALYSIS
            </span>
          </div>
        </div>

        <span className="bg-[#07531d] text-yellow-400 text-[10px] font-black italic uppercase px-3.5 py-1 rounded-full shadow-xs">
          LIVE DISTRICT DATA
        </span>
      </div>

      {/* 4 Impact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Mobilized Forces */}
        <div className="bg-[#eef9f2] border border-[#bbf7d0] rounded-[28px] sm:rounded-[36px] p-5 shadow-xs flex flex-col justify-between">
          <span className="bg-white/90 border border-emerald-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black italic uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs w-fit">
            <Users className="w-3 h-3 text-emerald-600" />
            REGISTERED VOLS
          </span>
          <div className="mt-4">
            <span className="text-4xl sm:text-5xl font-black italic text-[#15803d] tracking-tight block leading-none">
              {volunteers.length}
            </span>
            <span className="text-[10px] font-black italic uppercase text-emerald-700 mt-1 block">
              Active Network
            </span>
          </div>
        </div>

        {/* Card 2: Volunteer Hours */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[28px] sm:rounded-[36px] p-5 shadow-xs flex flex-col justify-between">
          <span className="bg-white/90 border border-blue-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black italic uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs w-fit">
            <Clock className="w-3 h-3 text-blue-600" />
            FIELD HOURS
          </span>
          <div className="mt-4">
            <span className="text-4xl sm:text-5xl font-black italic text-[#2563eb] tracking-tight block leading-none">
              {stats.totalVolunteerHours || 420}
            </span>
            <span className="text-[10px] font-black italic uppercase text-blue-700 mt-1 block">
              Impact Hours
            </span>
          </div>
        </div>

        {/* Card 3: Lives Touched */}
        <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[28px] sm:rounded-[36px] p-5 shadow-xs flex flex-col justify-between">
          <span className="bg-white/90 border border-orange-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black italic uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs w-fit">
            <Heart className="w-3 h-3 text-orange-600" />
            BENEFICIARIES
          </span>
          <div className="mt-4">
            <span className="text-4xl sm:text-5xl font-black italic text-[#ea580c] tracking-tight block leading-none">
              {stats.totalBeneficiaries || '2.5K+'}
            </span>
            <span className="text-[10px] font-black italic uppercase text-orange-700 mt-1 block">
              Direct Community Reach
            </span>
          </div>
        </div>

        {/* Card 4: Initiatives Completed */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-[28px] sm:rounded-[36px] p-5 shadow-md flex flex-col justify-between">
          <span className="bg-zinc-800 border border-zinc-700 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-black italic uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs w-fit">
            <Award className="w-3 h-3 text-yellow-400" />
            TOTAL MISSIONS
          </span>
          <div className="mt-4">
            <span className="text-4xl sm:text-5xl font-black italic text-white tracking-tight block leading-none">
              {projects.length}
            </span>
            <span className="text-[10px] font-black italic uppercase text-yellow-400 mt-1 block">
              District Initiatives
            </span>
          </div>
        </div>
      </div>

      {/* Upazila Sector Distribution */}
      <div className="bg-white rounded-[32px] border-2 border-slate-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-black italic uppercase text-slate-900 text-sm sm:text-base tracking-wider">
              UPAZILA / SECTOR DEPLOYMENT
            </h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">
              Active volunteer density across Mymensingh District
            </p>
          </div>
          <span className="text-xs font-black italic uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            13 Upazilas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upazilaDistribution.map((item, idx) => (
            <div
              key={item.name}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-black italic uppercase text-xs text-slate-900">{item.name}</h4>
                  <span className="text-[10px] text-slate-500 font-bold">{item.bengali}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 block leading-none">
                  {item.volunteers} vols
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                  {item.projects} missions
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
