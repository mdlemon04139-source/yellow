import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/Auth/AuthGateway';
import { UpazilaSelector } from './components/Home/UpazilaSelector';
import { StatCards } from './components/Home/StatCards';
import { ActiveProjectsList } from './components/Home/ActiveProjectsList';
import { RecentCompletedProjects } from './components/Home/RecentCompletedProjects';
import { TopProjectsSection } from './components/Home/TopProjectsSection';
import { ProjectLaunchModal } from './components/Home/ProjectLaunchModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { ArmyDirectory } from './components/Army/ArmyDirectory';
import { RadioView } from './components/Radio/RadioView';
import { AdminView } from './components/Admin/AdminView';
import { ProfileView } from './components/Profile/ProfileView';
import { ProjectDetailsModal } from './components/Home/ProjectDetailsModal';
import { PublicVerificationModal } from './components/PublicVerificationModal';
import { Volunteer } from './types';

export type HomeStatCategory = 'all' | 'this_year' | 'this_month' | 'ongoing' | 'upcoming';

// Memoized views to eliminate redundant component re-evaluations and re-renders
const MemoizedNavbar = React.memo(Navbar);
const MemoizedBottomNav = React.memo(BottomNav);
const MemoizedUpazilaSelector = React.memo(UpazilaSelector);
const MemoizedStatCards = React.memo(StatCards);
const MemoizedActiveProjectsList = React.memo(ActiveProjectsList);
const MemoizedRecentCompletedProjects = React.memo(RecentCompletedProjects);
const MemoizedTopProjectsSection = React.memo(TopProjectsSection);
const MemoizedCalendarView = React.memo(CalendarView);
const MemoizedArmyDirectory = React.memo(ArmyDirectory);
const MemoizedRadioView = React.memo(RadioView);
const MemoizedAdminView = React.memo(AdminView);
const MemoizedProfileView = React.memo(ProfileView);

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    currentUser,
    selectedProjectModal,
    setSelectedProjectModal,
    projects,
    loadVolunteerByIdOrCode,
    ensureVolunteersLoaded,
  } = useApp();

  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<HomeStatCategory>('all');
  const [verifyTargetVolunteer, setVerifyTargetVolunteer] = useState<Volunteer | null>(null);
  const verifiedParamRef = useRef<string | null>(null);

  // Memoized handlers to maintain stable references
  const handleOpenLaunchModal = useCallback(() => setIsLaunchModalOpen(true), []);
  const handleCloseLaunchModal = useCallback(() => setIsLaunchModalOpen(false), []);
  const handleCloseProjectModal = useCallback(() => setSelectedProjectModal(null), [setSelectedProjectModal]);
  const handleSelectCategory = useCallback(
    (cat: HomeStatCategory) => setSelectedCategoryFilter((prev) => (prev === cat ? 'all' : cat)),
    []
  );
  const handleClearFilter = useCallback(() => setSelectedCategoryFilter('all'), []);

  const handleCloseVerification = useCallback(() => {
    setVerifyTargetVolunteer(null);
    verifiedParamRef.current = null;
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, []);

  // Efficient, memoized useEffect hook:
  // Coordinates targeted loading of volunteer/project data strictly on demand
  // and guards against duplicate document reads across tab switches.
  const loadedFeaturesRef = useRef<{ volunteers: boolean }>({
    volunteers: false,
  });

  useEffect(() => {
    if (!currentUser) return;

    // Load volunteer data strictly when entering volunteer-centric tabs
    if ((activeTab === 'army' || activeTab === 'admin') && !loadedFeaturesRef.current.volunteers) {
      loadedFeaturesRef.current.volunteers = true;
      ensureVolunteersLoaded();
    }
  }, [activeTab, currentUser, ensureVolunteersLoaded]);

  // Targeted single-document verification read using query param (?verify=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam && verifyParam !== verifiedParamRef.current) {
      verifiedParamRef.current = verifyParam;
      loadVolunteerByIdOrCode(verifyParam).then((matched) => {
        if (matched) {
          setVerifyTargetVolunteer(matched);
        }
      });
    }
  }, [loadVolunteerByIdOrCode]);

  // Memoized active tab view to prevent whole-tree re-rendering
  const activeTabContent = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 animate-fadeIn">
            <MemoizedUpazilaSelector />
            <MemoizedStatCards
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={handleSelectCategory}
            />
            <MemoizedActiveProjectsList
              onOpenLaunchModal={handleOpenLaunchModal}
              categoryFilter={selectedCategoryFilter}
              onClearFilter={handleClearFilter}
            />
            <MemoizedRecentCompletedProjects />
            <MemoizedTopProjectsSection />
          </div>
        );
      case 'calendar':
        return (
          <div className="animate-fadeIn">
            <MemoizedCalendarView onOpenLaunchModal={handleOpenLaunchModal} />
          </div>
        );
      case 'army':
        return (
          <div className="animate-fadeIn">
            <MemoizedArmyDirectory />
          </div>
        );
      case 'radio':
        return (
          <div className="animate-fadeIn">
            <MemoizedRadioView />
          </div>
        );
      case 'admin':
        return (
          <div className="animate-fadeIn">
            <MemoizedAdminView />
          </div>
        );
      case 'profile':
        return (
          <div className="animate-fadeIn">
            <MemoizedProfileView />
          </div>
        );
      default:
        return null;
    }
  }, [
    activeTab,
    selectedCategoryFilter,
    handleSelectCategory,
    handleClearFilter,
    handleOpenLaunchModal,
  ]);

  // Authentication Gateway
  if (!currentUser) {
    return (
      <>
        <AuthGateway />
        {verifyTargetVolunteer && (
          <PublicVerificationModal
            volunteer={verifyTargetVolunteer}
            projects={projects}
            onClose={handleCloseVerification}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col selection:bg-yellow-400 selection:text-slate-950 font-sans pb-24 md:pb-20">
      {/* Top Forest Green Header */}
      <MemoizedNavbar onOpenLaunchModal={handleOpenLaunchModal} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        {activeTabContent}
      </main>

      {/* Bottom Floating Navigation Dock */}
      <MemoizedBottomNav />

      {/* Modals */}
      <ProjectLaunchModal
        isOpen={isLaunchModalOpen}
        onClose={handleCloseLaunchModal}
      />
      <ProjectDetailsModal
        project={selectedProjectModal}
        onClose={handleCloseProjectModal}
      />
      <AuthModal />
      {verifyTargetVolunteer && (
        <PublicVerificationModal
          volunteer={verifyTargetVolunteer}
          projects={projects}
          onClose={handleCloseVerification}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
