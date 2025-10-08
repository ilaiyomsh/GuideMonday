import React, { useState, useEffect } from 'react';
import { useGuide } from './context/GuideContext.jsx';

import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import ChapterPage from './components/ChapterPage';
import GuideSetup from './components/GuideSetup';
import { Loader, Box } from '@vibe/core';

export default function App() {
  const { guideData, isLoading, isEditMode, loadGuideData } = useGuide();
  const [currentPage, setCurrentPage] = useState('home-page');
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

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

  const currentChapter = guideData?.chapters?.find(ch => ch.id === currentChapterId);

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
    <div className={`App app-with-navbar ${isEditMode ? 'edit-mode-active' : ''}`}>
      <NavBar 
        currentPage={currentPage}
        currentChapterId={currentChapterId}
        onNavigate={handleNavigate}
      />
      
      <main className="main-content">
        <div id="home-page" className={`page-view ${currentPage === 'home-page' ? '' : 'hidden'}`}>
          <HomePage onNavigate={handleNavigate} />
        </div>

        <div id="chapter-page" className={`page-view ${currentPage === 'chapter-page' ? '' : 'hidden'}`}>
          <ChapterPage chapter={currentChapter} onNavigate={handleNavigate} />
        </div>
      </main>
    </div>
  );
}