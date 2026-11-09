import React, { useRef, useState, useMemo } from 'react';
import { Volunteer, UpazilaName, BoardPhoto } from '../../types';
import { VolunteerCard } from './VolunteerCard';
import { MYMENSINGH_UPAZILAS, UPAZILA_BENGALI_NAMES } from '../../types';
import { ArrowLeft, Users, Camera, Shield, ChevronRight, Upload } from 'lucide-react';
import { compressImage } from '../../utils/storageAndImage';
import { useApp } from '../../context/AppContext';

interface ZoneViewProps {
  volunteers: Volunteer[];
  selectedZone: UpazilaName | 'All';
  onSelectZone: (zone: UpazilaName | 'All') => void;
  onSelectVolunteer: (vol: Volunteer) => void;
  isAdmin: boolean;
  onDeleteVolunteer?: (id: string) => void;
  boardPhotos: BoardPhoto[];
  onUpdateBoardPhoto: (scope: UpazilaName | 'District', photoUrl: string, title?: string, caption?: string) => Promise<void>;
}

export const ZoneView: React.FC<ZoneViewProps> = ({
  volunteers,
  selectedZone,
  onSelectZone,
  onSelectVolunteer,
  isAdmin,
  onDeleteVolunteer,
  boardPhotos,
  onUpdateBoardPhoto,
}) => {
  const { language } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const districtPhotoInputRef = useRef<HTMLInputElement>(null);
  const upazilaPhotoInputRef = useRef<HTMLInputElement>(null);

  // Upazila counts
  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MYMENSINGH_UPAZILAS.forEach((upz) => {
      counts[upz] = volunteers.filter((v) => v.upazila === upz).length;
    });
    return counts;
  }, [volunteers]);

  // District board photo
  const districtBoardPhoto = useMemo(() => {
    return boardPhotos.find((p) => p.scope === 'District') || boardPhotos[0];
  }, [boardPhotos]);

  // Active zone photo for selected upazila
  const currentUpazilaPhoto = useMemo(() => {
    if (selectedZone === 'All') return null;
    return boardPhotos.find((p) => p.scope === selectedZone);
  }, [boardPhotos, selectedZone]);

  const filteredVolunteers = useMemo(() => {
    if (selectedZone === 'All') return volunteers;
    return volunteers.filter((v) => v.upazila === selectedZone);
  }, [volunteers, selectedZone]);

  // Direct file upload handler
  const handleDirectPhotoUpload = async (scope: UpazilaName | 'District', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 1200, 750, 0.82);
      if (compressed) {
        await onUpdateBoardPhoto(
          scope,
          compressed,
          scope === 'District' ? 'The Respected District Board' : `The Respected ${scope} Board`,
          scope === 'District' ? 'Volunteer for Bangladesh, Mymensingh District' : `Volunteer for Bangladesh, ${scope}`
        );
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // 1. Grid of Upazila Zones (When 'All' is selected)
  if (selectedZone === 'All') {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Hidden file input for District Board Photo */}
        <input
          type="file"
          ref={districtPhotoInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleDirectPhotoUpload('District', e)}
        />

        {/* DISTRICT BOARD PHOTO CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Top minimal bar with Admin Upload button */}
          <div className="bg-[#053712] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm sm:text-base font-black font-army tracking-wide text-white uppercase">
                The Respected District Board
              </h3>
            </div>

            {isAdmin && (
              <button
                disabled={isUploading}
                onClick={() => districtPhotoInputRef.current?.click()}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-army font-black text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer uppercase transition disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
              </button>
            )}
          </div>

          {/* District Board Photo Display */}
          <div className="relative h-60 sm:h-76 w-full bg-slate-950 overflow-hidden">
            {districtBoardPhoto?.photoUrl ? (
              <img
                src={districtBoardPhoto.photoUrl}
                alt="The Respected District Board"
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <Camera className="w-10 h-10 mb-2 text-slate-500" />
                <p className="font-army text-xs font-black uppercase text-slate-300">
                  No District Board Photo Uploaded Yet
                </p>
                {isAdmin && (
                  <button
                    onClick={() => districtPhotoInputRef.current?.click()}
                    className="mt-2 text-xs font-bold text-yellow-400 underline cursor-pointer"
                  >
                    Click to Upload Directly
                  </button>
                )}
              </div>
            )}

            {/* Bottom Overlay: The Respected District Board / Volunteer for Bangladesh, Mymensingh District */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
              <h4 className="font-army font-black text-lg sm:text-2xl text-white uppercase tracking-wide">
                The Respected District Board
              </h4>
              <p className="text-xs sm:text-sm text-yellow-300 font-bold mt-0.5">
                Volunteer for Bangladesh, Mymensingh District
              </p>
            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-xs font-black italic uppercase text-slate-700 tracking-wider">
            ALL 13 UPAZILA SECTORS & BOARDS
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Select an upazila to view board & volunteers
          </span>
        </div>

        {/* 13 Upazila Cards Grid: 3 columns on mobile and desktop */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 lg:gap-4">
          {MYMENSINGH_UPAZILAS.map((upz) => {
            const count = zoneCounts[upz] || 0;
            const bnName = UPAZILA_BENGALI_NAMES[upz] || upz;
            const displayUpzName = language === 'bn' ? bnName : upz;
            const upzPhoto = boardPhotos.find((p) => p.scope === upz);

            return (
              <div
                key={upz}
                onClick={() => onSelectZone(upz)}
                className="bg-white hover:bg-emerald-50/20 rounded-2xl border border-slate-200 hover:border-emerald-500 card-interactive cursor-pointer group flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md"
              >
                {/* Upazila Board Photo Banner */}
                <div className="relative h-20 sm:h-28 md:h-32 w-full bg-slate-800 overflow-hidden">
                  {upzPhoto?.photoUrl ? (
                    <img
                      src={upzPhoto.photoUrl}
                      alt={`${upz} Board`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                      <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-slate-500 mb-0.5 sm:mb-1" />
                      <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400">Board Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                    <span className="bg-black/70 backdrop-blur-xs text-yellow-300 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border border-yellow-400/40">
                      {count} {language === 'bn' ? 'জন' : (count === 1 ? 'vol' : 'vols')}
                    </span>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1.5 sm:left-3 right-1.5 sm:right-3">
                    <h4 className="font-army font-black text-[10px] sm:text-xs md:text-sm text-white uppercase truncate">
                      {language === 'bn' ? 'উপজেলা বোর্ড' : 'Upazila Board'}
                    </h4>
                    <p className="text-[9px] sm:text-[11px] text-yellow-300 font-bold truncate">
                      {displayUpzName}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 sm:p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-slate-800 font-bold truncate">
                      {displayUpzName}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase text-emerald-700 group-hover:text-emerald-900 transition shrink-0">
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Specific Upazila Selected View: Upazila Board Photo at top, then list of volunteers
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Hidden file input for Upazila Board Photo */}
      <input
        type="file"
        ref={upazilaPhotoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleDirectPhotoUpload(selectedZone, e)}
      />

      {/* Back Button & Zone Action Bar */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => onSelectZone('All')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সকল ১৩টি জোনে ফিরে যান' : 'Back to All 13 Zones'}</span>
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black font-army text-slate-900 uppercase">
              {language === 'bn'
                ? `${UPAZILA_BENGALI_NAMES[selectedZone] || selectedZone} সেক্টর`
                : `${selectedZone} Sector`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 border border-emerald-300 text-emerald-900 font-army font-black text-xs px-3 py-1 rounded-full uppercase">
            {filteredVolunteers.length} Personnel
          </span>
          {isAdmin && (
            <button
              disabled={isUploading}
              onClick={() => upazilaPhotoInputRef.current?.click()}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-army font-black text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1 cursor-pointer uppercase transition"
            >
              <Upload className="w-3 h-3" />
              <span>{isUploading ? 'Uploading...' : 'Upload Board Photo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP: Upazila Board Members Photo Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="relative h-48 sm:h-64 w-full bg-slate-950 overflow-hidden">
          {currentUpazilaPhoto?.photoUrl ? (
            <img
              src={currentUpazilaPhoto.photoUrl}
              alt={`The Respected ${selectedZone} Board`}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Camera className="w-10 h-10 mb-2 text-slate-500" />
              <p className="font-army text-xs font-black uppercase text-slate-300">
                No Board Photo Uploaded for {selectedZone} Yet
              </p>
              {isAdmin && (
                <button
                  onClick={() => upazilaPhotoInputRef.current?.click()}
                  className="mt-2 text-xs font-bold text-yellow-400 underline cursor-pointer"
                >
                  Click to Upload Board Photo
                </button>
              )}
            </div>
          )}

          {/* Bottom Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
            <h4 className="font-army font-black text-base sm:text-xl text-white uppercase tracking-wide">
              {language === 'bn' ? 'উপজেলা বোর্ড মেম্বারবৃন্দ' : 'The Respected Upazila Board'}
            </h4>
            <p className="text-xs sm:text-sm text-yellow-300 font-bold mt-0.5">
              Volunteer for Bangladesh, {language === 'bn' ? (UPAZILA_BENGALI_NAMES[selectedZone] || selectedZone) : selectedZone}
            </p>
          </div>
        </div>
      </div>

      {/* THEN: Volunteer List in this Upazila */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black italic uppercase text-slate-700 tracking-wider">
            {language === 'bn' ? (UPAZILA_BENGALI_NAMES[selectedZone] || selectedZone) : selectedZone} {language === 'bn' ? 'এর ভলান্টিয়ারবৃন্দ' : 'VOLUNTEERS'} ({filteredVolunteers.length})
          </span>
        </div>

        {filteredVolunteers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-army font-black text-xs text-slate-400 uppercase tracking-wider">
              No registered volunteers in {selectedZone} sector yet
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Be the first to enroll for this sector!
            </p>
          </div>
        ) : (
          filteredVolunteers.map((vol) => (
            <VolunteerCard
              key={vol.id}
              volunteer={vol}
              onSelect={onSelectVolunteer}
              isAdmin={isAdmin}
              onDelete={onDeleteVolunteer}
            />
          ))
        )}
      </div>
    </div>
  );
};
