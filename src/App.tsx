/**
 * Health Episode Record System
 * Personal Pharmacist–Led Digital Primary Care
 * Google Sheet ID: 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 * Google Drive Folder: 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
 */

import React, { useState, useEffect } from 'react';
import { HealthProvider, useHealthSystem } from './context/HealthSystemContext';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { AuthView } from './components/AuthView';
import { PatientDashboard } from './components/PatientDashboard';
import { PharmacistDashboard } from './components/PharmacistDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CreateEpisodeModal } from './components/CreateEpisodeModal';
import { AssessmentModal } from './components/AssessmentModal';
import { PatientFeedbackModal } from './components/PatientFeedbackModal';
import { ErDiagramModal } from './components/ErDiagramModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { HealthEpisode, Patient, ClinicalAssessment } from './types/healthSystem';
import { Activity } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser } = useHealthSystem();

  // Tab State: 'patient' | 'pharmacist' | 'admin'
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (currentUser?.Role === 'Pharmacist') return 'pharmacist';
    if (currentUser?.Role === 'Admin') return 'admin';
    return 'patient';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keep currentTab synchronized when user logs in with a specific role
  useEffect(() => {
    if (currentUser?.Role === 'Patient') setCurrentTab('patient');
    else if (currentUser?.Role === 'Pharmacist') setCurrentTab('pharmacist');
    else if (currentUser?.Role === 'Admin') setCurrentTab('admin');
  }, [currentUser?.Role]);

  // Modals
  const [isCreateEpisodeOpen, setIsCreateEpisodeOpen] = useState(false);
  const [assessmentModalData, setAssessmentModalData] = useState<{
    isOpen: boolean;
    episode?: HealthEpisode;
    patient?: Patient;
  }>({ isOpen: false });

  const [feedbackModalData, setFeedbackModalData] = useState<{
    isOpen: boolean;
    assessment?: ClinicalAssessment;
  }>({ isOpen: false });

  const [isErModalOpen, setIsErModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Success Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAssessment = (episode: HealthEpisode, patient: Patient) => {
    setAssessmentModalData({
      isOpen: true,
      episode,
      patient,
    });
  };

  const handleOpenFeedback = (assessment: ClinicalAssessment) => {
    setFeedbackModalData({
      isOpen: true,
      assessment,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans">
      {/* 1. Emergency Red-Flag Banner */}
      <EmergencyBanner />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-600 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <Activity className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main Content & Navigation Layout */}
      {currentUser ? (
        <div className="flex-1 flex flex-row min-h-0 w-full">
          {/* Left Sidebar Menu */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            openErModal={() => setIsErModalOpen(true)}
            openProfileModal={() => setIsProfileModalOpen(true)}
            openCreateEpisodeModal={() => setIsCreateEpisodeOpen(true)}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 flex flex-col">
            <TopHeader
              currentTab={currentTab}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              openProfileModal={() => setIsProfileModalOpen(true)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
              {currentUser.Role === 'Patient' && (
                <PatientDashboard
                  onOpenCreateEpisode={() => setIsCreateEpisodeOpen(true)}
                  onOpenFeedback={as => handleOpenFeedback(as)}
                />
              )}

              {currentUser.Role === 'Pharmacist' && (
                <PharmacistDashboard
                  onOpenAssessment={(ep, pt) => handleOpenAssessment(ep, pt)}
                />
              )}

              {currentUser.Role === 'Admin' && <AdminDashboard />}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 no-print mt-auto">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    RX
                  </div>
                  <span className="font-bold text-slate-700">Personal Pharmacist–Led Digital Primary Care</span>
                  <span className="text-slate-400">| ระบบบริบาลเภสัชกรรมปฐมภูมิ</span>
                </div>

                <div className="text-[11px] text-slate-400">
                  มาตรฐานการคุ้มครองข้อมูลสุขภาพส่วนบุคคล (PDPA) • ระบบฐานข้อมูลเวชระเบียน 16 ตารางสัมพันธ์
                </div>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full flex items-center justify-center">
          <AuthView onSuccessLogin={() => showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับครับ/ค่ะ')} />
        </main>
      )}

      {/* 4. Modals */}
      {/* Create Episode Modal (Patient Only) */}
      <CreateEpisodeModal
        isOpen={isCreateEpisodeOpen}
        onClose={() => setIsCreateEpisodeOpen(false)}
        onSuccess={epId => {
          setIsCreateEpisodeOpen(false);
          showToast(`บันทึก Health Episode รหัส ${epId} สำเร็จเรียบร้อย`);
          setCurrentTab('patient');
        }}
      />

      {/* Clinical Assessment Modal (Pharmacist Only) */}
      {assessmentModalData.isOpen && assessmentModalData.episode && assessmentModalData.patient && (
        <AssessmentModal
          isOpen={assessmentModalData.isOpen}
          onClose={() => setAssessmentModalData({ isOpen: false })}
          episode={assessmentModalData.episode}
          patient={assessmentModalData.patient}
          onSuccess={asId => {
            setAssessmentModalData({ isOpen: false });
            showToast(`บันทึกผลการประเมินทางคลินิกรหัส ${asId} สำเร็จ`);
          }}
        />
      )}

      {/* Patient Feedback Modal (Patient Only) */}
      {feedbackModalData.isOpen && feedbackModalData.assessment && (
        <PatientFeedbackModal
          isOpen={feedbackModalData.isOpen}
          onClose={() => setFeedbackModalData({ isOpen: false })}
          assessment={feedbackModalData.assessment}
          onSuccess={() => {
            setFeedbackModalData({ isOpen: false });
            showToast('บันทึกผลลัพธ์และความพึงพอใจของท่านเรียบร้อยแล้ว ขอบคุณครับ/ค่ะ');
          }}
        />
      )}

      {/* ER Diagram & Data Dictionary Modal */}
      <ErDiagramModal
        isOpen={isErModalOpen}
        onClose={() => setIsErModalOpen(false)}
      />

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />


    </div>
  );
};

export default function App() {
  return (
    <HealthProvider>
      <MainApp />
    </HealthProvider>
  );
}
