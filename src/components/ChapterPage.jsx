import React, { useState, useEffect } from 'react';
import { useGuide } from '../context/GuideContext';
import ContentBlock from './ContentBlock';
import { Edit, MoveArrowUp, MoveArrowDown, Delete } from '@vibe/icons';

export default function ChapterPage({ chapter, onNavigate }) {
  const { isEditMode, handleAddSection, handleAddContentBlock, handleUpdateChapter, handleUpdateSection, handleReorderSection, handleDeleteSection } = useGuide();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [editingChapter, setEditingChapter] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [chapterData, setChapterData] = useState({ title: '', content: '' });
  const [sectionData, setSectionData] = useState({ title: '', content: '' });

  // Collapse all sections when chapter changes
  useEffect(() => {
    setExpandedSections(new Set());
  }, [chapter?.id]);

  const toggleSectionExpansion = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };


  const handleEditChapter = () => {
    setEditingChapter(true);
    setChapterData({
      title: chapter.title,
      content: chapter.content || ''
    });
  };

  const handleSaveChapter = () => {
    handleUpdateChapter(chapter.id, chapterData);
    setEditingChapter(false);
  };

  const handleCancelChapterEdit = () => {
    setEditingChapter(false);
    setChapterData({ title: chapter.title, content: chapter.content || '' });
  };

  const handleEditSection = (section) => {
    setEditingSection(section.id);
    setSectionData({
      title: section.title,
      content: section.content || ''
    });
  };

  const handleSaveSection = () => {
    handleUpdateSection(chapter.id, editingSection, sectionData);
    setEditingSection(null);
  };

  const handleCancelSectionEdit = () => {
    setEditingSection(null);
    setSectionData({ title: '', content: '' });
  };

  if (!chapter) {
    return <div className="loading-container"><p>Chapter not found.</p></div>;
  }

  return (
    <div className="chapter-page">
      <header className="page-header">
        {editingChapter ? (
          <div className="edit-form">
            <input
              type="text"
              value={chapterData.title}
              onChange={(e) => setChapterData({...chapterData, title: e.target.value})}
              className="edit-input title-input"
              placeholder="כותרת הפרק"
            />
            <textarea
              value={chapterData.content}
              onChange={(e) => setChapterData({...chapterData, content: e.target.value})}
              className="edit-textarea"
              placeholder="תוכן הפרק"
              rows="3"
            />
            <div className="edit-actions">
              <button className="save-edit-button" onClick={handleSaveChapter}>
                שמור
              </button>
              <button className="cancel-edit-button" onClick={handleCancelChapterEdit}>
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div className="page-header-content">
            <div className="header-text">
          <h1>{chapter.title}</h1>
              {chapter.content && (
                <p className="chapter-content">{chapter.content}</p>
              )}
              {isEditMode && (
                <button className="edit-content-button" onClick={handleEditChapter} title="ערוך">
                  <Edit />
                </button>
              )}
            </div>
          </div>
        )}
        </header>
      
      <div className="sections-container">
        {chapter.sections && chapter.sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <section key={section.id} id={`section-${section.id}`} className="section">
              {editingSection === section.id ? (
                <div className="edit-form section-edit-form">
                  <input
                    type="text"
                    value={sectionData.title}
                    onChange={(e) => setSectionData({...sectionData, title: e.target.value})}
                    className="edit-input title-input"
                    placeholder="כותרת הסעיף"
                  />
                  <textarea
                    value={sectionData.content}
                    onChange={(e) => setSectionData({...sectionData, content: e.target.value})}
                    className="edit-textarea"
                    placeholder="תוכן הסעיף"
                    rows="2"
                  />
                  <div className="edit-actions">
                    <button className="save-edit-button" onClick={handleSaveSection}>
                      שמור
                    </button>
                    <button className="cancel-edit-button" onClick={handleCancelSectionEdit}>
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`section-accordion-toggle ${isExpanded ? 'active' : ''}`}
                  onMouseEnter={(e) => {
                    if (isEditMode) {
                      const controls = e.currentTarget.querySelector('.section-controls');
                      if (controls) controls.style.display = 'flex';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isEditMode) {
                      const controls = e.currentTarget.querySelector('.section-controls');
                      if (controls) controls.style.display = 'none';
                    }
                  }}
                >
                  <button 
                    className="section-toggle-button"
                    onClick={() => toggleSectionExpansion(section.id)}
                  >
                    <span>{index + 1}.{index + 1} {section.title}</span>
                    <svg className="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                  <div className="section-controls">
                    {isEditMode && (
                      <>
                        <button 
                          className="section-control-button edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSection(section);
                          }}
                          title="ערוך סעיף"
                        >
                          <Edit />
                        </button>
                        <button 
                          className="section-control-button move-up"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderSection(chapter.id, index, 'up');
                          }}
                          disabled={index === 0}
                          title="העבר למעלה"
                        >
                          <MoveArrowUp />
                        </button>
                        <button 
                          className="section-control-button move-down"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderSection(chapter.id, index, 'down');
                          }}
                          disabled={index === chapter.sections.length - 1}
                          title="העבר למטה"
                        >
                          <MoveArrowDown />
                        </button>
                        <button 
                          className="section-control-button delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(chapter.id, section.id);
                          }}
                          title="מחק סעיף"
                        >
                          <Delete />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Section Content - Always visible */}
              {section.content && (
                <div className="section-content">
                  <p>{section.content}</p>
                </div>
              )}
              
              {/* Content Blocks - Only visible when expanded */}
              <div className={`accordion-content ${isExpanded ? 'open' : ''}`}>
                {section.contentBlocks && section.contentBlocks.map((block, blockIndex) => (
                  <ContentBlock 
                    key={block.id} 
                    block={block} 
                    isEditMode={isEditMode}
            chapterId={chapter.id}
                    sectionId={section.id}
                    blockIndex={blockIndex}
                    totalBlocks={section.contentBlocks.length}
          />
        ))}
                
                {isEditMode && (
                  <div className="add-controls-container">
                    <div className="add-block-controls">
                      <button 
                        className="add-block-button" 
                        title="הוסף טקסט"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'text')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.17,18 15,18V19H9V18C9.83,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"></path>
                        </svg>
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף תמונה"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'image')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21,19V5C21,3.89 20.1,3 19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19M8.5,13.5L11,16.5L14.5,12L19,18H5L8.5,13.5Z"></path>
                        </svg>
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף וידאו"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'video')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"></path>
                        </svg>
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף GIF"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'gif')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9,9H7.5V15H9V9M13,9H10.5V15H13V13H11.5V12H13V10.5H11.5V9.5H13V9M17,9H14V15H17V12.5H15.5V14H15V10.5H17V9Z"></path>
                        </svg>
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף קישור"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'link')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {isEditMode && (
        <button className="add-item-button" onClick={() => handleAddSection(chapter.id)}>+ הוסף סעיף</button>
      )}
    </div>
  );
}