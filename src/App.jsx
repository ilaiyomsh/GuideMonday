import React, { useState, useEffect } from "react";
import "./App.css";
import "@vibe/core/tokens";
import mondaySdk from "monday-sdk-js";

// Import the custom hook FROM THE CONTEXT that provides all the logic
import { useGuide } from './context/GuideContext'; 

// Import presentational components
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import ChapterPage from "./components/ChapterPage";

const monday = mondaySdk();

const App = () => {
  const [activePage, setActivePage] = useState({ type: 'home', id: null });
  const [context, setContext] = useState();
  
  // Now we get everything we need from our new useGuide hook!
  // No more "prop drilling". App component is clean.
  const { guideData, isLoading, setIsEditMode, handleSave, isEditMode } = useGuide();

  useEffect(() => {
    monday.listen("context", (res) => {
      setContext(res.data);
    });
  }, []);

  const handleNavigate = (type, id = null) => {
    setActivePage({ type, id });
  };
  
  if (isLoading || !guideData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"><div className="spinner"></div><p>Loading your guide...</p></div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activePage.type) {
      case 'home':
        // NOTICE: No more props are needed for HomePage!
        return <HomePage onNavigate={handleNavigate} />;
      case 'chapter':
        const chapter = guideData.chapters.find(c => c.id === active.id);
        if (!chapter) {
            handleNavigate('home');
            return null;
        }
        // NOTICE: No more props are needed for ChapterPage!
        return <ChapterPage chapter={chapter} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      <div className="app-header">
        <div className="header-controls">
          <button onClick={() => setIsEditMode(!isEditMode)} className={`toggle-edit-btn ${isEditMode ? 'active' : ''}`}>
            {isEditMode ? '👁️ View Mode' : '✏️ Edit Mode'}
          </button>
          {isEditMode && (<button onClick={handleSave} className="save-btn">💾 Save Changes</button>)}
        </div>
      </div>
      <div className="app-layout">
        <Sidebar onNavigate={handleNavigate} activePageId={activePage.id} />
        <main className="main-content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;