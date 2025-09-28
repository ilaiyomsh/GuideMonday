import React, { useState } from 'react';
import { useGuide } from '../context/GuideContext';
import { Edit } from '@vibe/icons';

export default function HomePage({ onNavigate }) {
  const { guideData, isEditMode, setIsEditMode, handleSave, handleUpdateHomePage } = useGuide();
  const [isEditingHomePage, setIsEditingHomePage] = useState(false);
  const [homePageData, setHomePageData] = useState({
    title: guideData?.homePage?.title || 'ברוכים הבאים',
    content: guideData?.homePage?.content || ''
  });

  if (!guideData) return <div>Loading home page...</div>;

  const handleChapterClick = (chapterId) => {
    onNavigate('chapter-page', chapterId);
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveClick = async () => {
    await handleSave();
  };

  const handleEditHomePage = () => {
    setIsEditingHomePage(true);
    setHomePageData({
      title: guideData.homePage?.title || 'ברוכים הבאים',
      content: guideData.homePage?.content || ''
    });
  };

  const handleSaveHomePage = () => {
    handleUpdateHomePage(homePageData);
    setIsEditingHomePage(false);
  };

  const handleCancelEdit = () => {
    setIsEditingHomePage(false);
    setHomePageData({
      title: guideData.homePage?.title || 'ברוכים הבאים',
      content: guideData.homePage?.content || ''
    });
  };

  return (
    <div className="home-page">
      <header className="page-header">
        {isEditingHomePage ? (
          <div className="edit-form">
            <input
              type="text"
              value={homePageData.title}
              onChange={(e) => setHomePageData({...homePageData, title: e.target.value})}
              className="edit-input title-input"
              placeholder="כותרת דף הבית"
            />
            <textarea
              value={homePageData.content}
              onChange={(e) => setHomePageData({...homePageData, content: e.target.value})}
              className="edit-textarea"
              placeholder="תוכן דף הבית"
              rows="3"
            />
            <div className="edit-actions">
              <button className="save-edit-button" onClick={handleSaveHomePage}>
                שמור
              </button>
              <button className="cancel-edit-button" onClick={handleCancelEdit}>
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div className="page-header-content">
            <div className="header-text">
              <h1>{guideData.homePage?.title || 'ברוכים הבאים'}</h1>
              {guideData.homePage?.content && (
                <p className="home-content">{guideData.homePage.content}</p>
              )}
              {isEditMode && (
                <button className="edit-content-button" onClick={handleEditHomePage} title="ערוך">
                  <Edit />
                </button>
              )}
            </div>
            <div className="edit-toggle-container">
              <span>מצב עריכה</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isEditMode} 
                  onChange={handleEditModeToggle}
                />
                <span className="slider"></span>
              </label>
              {isEditMode && (
                <button className="save-button" onClick={handleSaveClick}>
                  שמור
                </button>
              )}
            </div>
          </div>
        )}
      </header>
      
      <div className="chapter-grid">
        {guideData.chapters && guideData.chapters.map((chapter, index) => (
          <div 
            key={chapter.id} 
            className="chapter-card"
            onClick={() => handleChapterClick(chapter.id)}
          >
            <h2>{index + 1}. {chapter.title}</h2>
            <p>{chapter.description || chapter.content || 'תיאור הפרק יופיע כאן'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}