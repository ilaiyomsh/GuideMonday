import React, { useState, useEffect, useRef } from 'react';
import { useGuide } from './context/GuideContext.jsx';

import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import ChapterPage from './components/ChapterPage';
import TableOfContents from './components/TableOfContents';
import GuideSetup from './components/GuideSetup';
import { Loader, Box } from '@vibe/core';
import ImageCropperModal from './components/ImageCropperModal';
import './styles/style-settings.css';

export default function App() {
  const { guideData, styleData, isLoading, isEditMode, loadGuideData, handleUpdateLogo } = useGuide();
  const [currentPage, setCurrentPage] = useState('home-page');
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  
  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleNavigate = (pageType, chapterId = null) => {
    if (pageType === 'home-page') {
      setCurrentPage('home-page');
      setCurrentChapterId(null);
    } else if (pageType === 'chapter-page' && chapterId) {
      setCurrentPage('chapter-page');
      setCurrentChapterId(chapterId);
    }
  };

  const handleGuideLoad = async (newGuideData) => {
    await loadGuideData(newGuideData);
    setShowSetup(false);
  };

  // Handle save cropped image - NEW in v4.0: uses styleData
  const handleSaveCroppedImage = (croppedBase64) => {
    console.log('💾 Saving cropped logo to style...');
    
    // Update style data with the cropped image in base64 format
    // Must save explicitly using "שמור עיצוב" button in StyleSettings
    handleUpdateLogo({
      image: croppedBase64,
      altText: 'LOGO'
    });
    
    console.log('✅ Logo updated successfully (remember to save in StyleSettings)');
  };

  const currentChapter = guideData?.chapters?.find(ch => ch.id === currentChapterId);

  // חישוב סגנון הרקע הגלובלי - NEW in v4.0: uses styleData
  const globalBackgroundStyle = styleData?.globalBackground 
    ? { backgroundColor: styleData.globalBackground }
    : {};

  // חישוב סגנון הגופן הגלובלי - NEW in v4.0: uses styleData
  const globalFontStyle = styleData?.font?.family
    ? { fontFamily: styleData.font.family }
    : {};

  // Show setup screen if no guide data and not loading
  if (!isLoading && !guideData) {
    return <GuideSetup onGuideLoad={handleGuideLoad} />;
  }

  if (isLoading) {
    return (
      <Box 
        className="loading-container"
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <Loader size={Loader.sizes.LARGE} />
      </Box>
    );
  }

  return (
    <div 
      className={`App app-with-navbar ${isEditMode ? 'edit-mode-active' : ''}`}
      style={{...globalBackgroundStyle, ...globalFontStyle}}
    >
      {/* Logo Section - Left Side of App */}
      {styleData?.logo?.image && (
        <div className="app-logo-section">
          <img 
            src={styleData.logo.image} 
            alt={styleData.logo.altText || 'Logo'} 
            className="app-logo-image"
          />
        </div>
      )}
      
      <NavBar 
        currentPage={currentPage} 
        currentChapterId={currentChapterId} 
        onNavigate={handleNavigate}
        onOpenUploadModal={() => setShowUploadModal(true)}
      />
      
      <main className="main-content">
        <div id="home-page" className={`page-view ${currentPage === 'home-page' ? '' : 'hidden'}`}>
          <HomePage onNavigate={handleNavigate} />
        </div>

        <div id="chapter-page" className={`page-view ${currentPage === 'chapter-page' ? '' : 'hidden'}`}>
          <ChapterPage chapter={currentChapter} onNavigate={handleNavigate} />
        </div>
      </main>

      {/* Table of Contents - מחוץ ל-main-content ולפרק */}
      {currentPage === 'chapter-page' && currentChapter && (
        <TableOfContents 
          sections={currentChapter.sections} 
          chapterTitle={currentChapter.title}
        />
      )}

      {/* Image Cropper Modal - מחוץ לכל ה-Dialogs */}
      <ImageCropperModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveCroppedImage}
        mode="logo"
      />
    </div>
  );
}