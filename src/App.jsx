import React, { useState, useEffect } from "react";
import "./App.css";
import "@vibe/core/tokens";
import mondaySdk from "monday-sdk-js";

// Import the custom hook that now manages all the logic
import { useGuideManager } from './hooks/useGuideManager';

// Import presentational components
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import ChapterPage from "./components/ChapterPage";

const monday = mondaySdk();

/**
 * The root component of the application.
 * After refactoring, its only responsibilities are:
 * 1. Laying out the main components (Header, Sidebar, Content).
 * 2. Handling client-side navigation (what page to show).
 * 3. Passing down state and functions from the useGuideManager hook to child components.
 */
const App = () => {
  // State for managing which page is currently viewed by the user
  const [activePage, setActivePage] = useState({ type: 'home', id: null });
  const [context, setContext] = useState();
  
  // The useGuideManager hook provides all the necessary data and logic
  const {
    guideData,
    isLoading,
    isEditMode,
    setIsEditMode,
    handleSave,
    handleUpdateHomePage,
    handleUpdateChapter,
    handleDeleteChapter,
    handleReorderChapter,
    handleAddChapter,
    handleUpdateSection,
    handleDeleteSection,
    onReorderSection,
    onAddSection,
    handleUpdateContentBlock,
    handleDeleteContentBlock,
    handleReorderContentBlock,
    handleAddContentBlock,
  } = useGuideManager();

  // Basic Monday SDK context listener
  useEffect(() => {
    monday.listen("context", (res) => {
      setContext(res.data);
    });
  }, []);

  // Handler for navigation events coming from Sidebar or HomePage
  const handleNavigate = (type, id = null) => {
    setActivePage({ type, id });
  };
  
  // Shows a loading indicator while the initial data is being fetched
  if (isLoading || !guideData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your guide...</p>
        </div>
      </div>
    );
  }

  // Determines which main content component to render based on the activePage state
  const renderMainContent = () => {
    switch (activePage.type) {
      case 'home':
        return (
          <HomePage
            homePageData={guideData.homePage}
            chapters={guideData.chapters}
            onNavigate={handleNavigate}
            isEditMode={isEditMode}
            onUpdateHomePage={handleUpdateHomePage}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onReorderChapter={handleReorderChapter}
            onAddChapter={handleAddChapter}
          />
        );
      case 'chapter':
        const chapter = guideData.chapters.find(c => c.id === activePage.id);
        if (!chapter) {
            // If for some reason the chapter is not found, navigate home
            handleNavigate('home');
            return null;
        }
        return (
          <ChapterPage 
            chapter={chapter}
            isEditMode={isEditMode}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onUpdateContentBlock={handleUpdateContentBlock}
            onDeleteContentBlock={handleDeleteContentBlock}
            onReorderSection={onReorderSection}
            onReorderContentBlock={handleReorderContentBlock}
            onAddSection={onAddSection}
            onAddContentBlock={handleAddContentBlock}
          />
        );
      default:
        return <HomePage homePageData={guideData.homePage} chapters={guideData.chapters} onNavigate={handleNavigate} isEditMode={isEditMode} />;
    }
  };

  return (
    <div className="App">
      <div className="app-header">
        <div className="header-controls">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`toggle-edit-btn ${isEditMode ? 'active' : ''}`}
          >
            {isEditMode ? '👁️ View Mode' : '✏️ Edit Mode'}
          </button>
          {isEditMode && (
            <button onClick={handleSave} className="save-btn">
              💾 Save Changes
            </button>
          )}
        </div>
      </div>
      <div className="app-layout">
        <Sidebar
          chapters={guideData.chapters || []}
          onNavigate={handleNavigate}
          activePageId={activePage.id}
        />
        <main className="main-content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;