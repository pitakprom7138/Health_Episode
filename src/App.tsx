/**
 * Health Episode Record System
 * ระบบบันทึกประวัติการเจ็บป่วยและการให้คำปรึกษาด้านสุขภาพโดยเภสัชกร
 * Google Sheet ID: 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 * Google Drive Folder: 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
 */

import React, { useState } from 'react';
import { HealthProvider, useHealthSystem } from './context/HealthSystemContext';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Navbar } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
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
  const { quickSwitchRole } = useHealthSystem();

  // Tab State: 'home' | 'patient' | 'pharmacist' | 'admin'
  const [currentTab, setCurrentTab] = useState<string>('home');

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

      {/* 2. Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openErModal={() => setIsErModalOpen(true)}
        openProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-600 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <Activity className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {currentTab === 'home' && (
          <HomeOverview
            onSelectRole={role => {
              quickSwitchRole(role);
              if (role === 'Patient') setCurrentTab('patient');
              else if (role === 'Pharmacist') setCurrentTab('pharmacist');
              else if (role === 'Admin') setCurrentTab('admin');
            }}
            onOpenErModal={() => setIsErModalOpen(true)}
            onOpenCreateEpisode={() => setIsCreateEpisodeOpen(true)}
          />
        )}

        {currentTab === 'patient' && (
          <PatientDashboard
            onOpenCreateEpisode={() => setIsCreateEpisodeOpen(true)}
            onOpenFeedback={as => handleOpenFeedback(as)}
          />
        )}

        {currentTab === 'pharmacist' && (
          <PharmacistDashboard
            onOpenAssessment={(ep, pt) => handleOpenAssessment(ep, pt)}
          />
        )}

        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* 4. Modals */}
      {/* Create Episode Modal */}
      <CreateEpisodeModal
        isOpen={isCreateEpisodeOpen}
        onClose={() => setIsCreateEpisodeOpen(false)}
        onSuccess={epId => {
          setIsCreateEpisodeOpen(false);
          showToast(`บันทึก Health Episode รหัส ${epId} สำเร็จเรียบร้อย`);
          setCurrentTab('patient');
        }}
      />

      {/* Clinical Assessment Modal */}
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

      {/* Patient Feedback Modal */}
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

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
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
  );
};

export default function App() {
  return (
    <HealthProvider>
      <MainApp />
    </HealthProvider>
  );
}
