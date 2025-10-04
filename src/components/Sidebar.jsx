import React, { useState } from 'react';
import { useGuide } from '../context/GuideContext';
import { Edit, MoveArrowUp, MoveArrowDown, Delete } from '@vibe/icons';

export default function Sidebar({ currentPage, currentChapterId, onNavigate }) {
  const { guideData, isEditMode, setIsEditMode, isOwner, handleAddChapter, handleReorderChapter, handleDeleteChapter, handleReorderSection, handleDeleteSection, handleSave } = useGuide();
  
  // Log isOwner status to console
 // console.log("🔍 Sidebar - isOwner status:", isOwner);
  const [expandedChapters, setExpandedChapters] = useState(new Set());

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveClick = async () => {
    await handleSave();
  };

  const toggleChapterExpansion = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleChapterClick = (chapterId) => {
    onNavigate('chapter-page', chapterId);
  };

  const handleSectionClick = (chapterId, sectionId) => {
    onNavigate('chapter-page', chapterId);
    // Scroll to section after navigation
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (!guideData || !guideData.chapters) {
    return <aside className="sidebar">Loading...</aside>;
  }

  return (
    <>
      <div className="sidebar-header">
        <h1>{guideData.title || 'מדריך מקיף לפיתוח Web'}</h1>
        {isOwner && (
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
        )}
      </div>
      <nav>
        <ul>
          <li>
            <span 
              className={`nav-link ${currentPage === 'home-page' ? 'active' : ''}`}
              onClick={() => onNavigate('home-page')}
            >
              עמוד הבית
            </span>
          </li>
          {guideData.chapters.map((chapter, chapterIndex) => {
            const isExpanded = expandedChapters.has(chapter.id);
            const hasSections = chapter.sections && chapter.sections.length > 0;
            
            return (
              <li key={chapter.id}>
                <div 
                  className="chapter-item"
                  onMouseEnter={(e) => {
                    if (isEditMode) {
                      const controls = e.currentTarget.querySelector('.chapter-controls');
                      if (controls) controls.style.display = 'flex';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isEditMode) {
                      const controls = e.currentTarget.querySelector('.chapter-controls');
                      if (controls) controls.style.display = 'none';
                    }
                  }}
                >
                  <span 
                    className={`chapter-title-link nav-link ${currentChapterId === chapter.id ? 'active' : ''}`}
                    onClick={() => handleChapterClick(chapter.id)}
                  >
                    {chapterIndex + 1}. {chapter.title}
                  </span>
                  <div className="chapter-controls">
                    {isEditMode && (
                      <>
                        <button 
                          className="chapter-action-button move-up"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderChapter(chapterIndex, 'up');
                          }}
                          disabled={chapterIndex === 0}
                          title="העבר למעלה"
                        >
                          <MoveArrowUp />
                        </button>
                        <button 
                          className="chapter-action-button move-down"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderChapter(chapterIndex, 'down');
                          }}
                          disabled={chapterIndex === guideData.chapters.length - 1}
                          title="העבר למטה"
                        >
                          <MoveArrowDown />
                        </button>
                        <button 
                          className="chapter-action-button delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(chapter.id);
                          }}
                          title="מחק פרק"
                        >
                          <Delete />
                        </button>
                      </>
                    )}
                  </div>
                  {hasSections && (
                    <button 
                      className={`chapter-accordion-toggle ${isExpanded ? 'active' : ''}`}
                      onClick={() => toggleChapterExpansion(chapter.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </button>
                  )}
                </div>
                {hasSections && (
                  <ul className={`accordion-content ${isExpanded ? 'open' : ''}`}>
                    {chapter.sections.map((section, sectionIndex) => (
                      <li key={section.id}>
                        <span 
                          className="nav-link"
                          onClick={() => handleSectionClick(chapter.id, section.id)}
                        >
                          {chapterIndex + 1}.{sectionIndex + 1} {section.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {isEditMode && (
        <button className="add-item-button" onClick={handleAddChapter}>+ הוסף פרק</button>
      )}
    </>
  );
}