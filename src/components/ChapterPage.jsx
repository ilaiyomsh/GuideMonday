import React, { useState, useEffect } from 'react';
import { useGuide } from '../context/GuideContext';
import ContentBlock from './ContentBlock';
import { Edit, MoveArrowUp, MoveArrowDown, Delete, TextFormatting, Image, Video, Gif, Link, Form } from '@vibe/icons';

export default function ChapterPage({ chapter, onNavigate }) {
  const { guideData, isEditMode, handleAddSection, handleAddContentBlock, handleUpdateChapter, handleUpdateSection, handleReorderSection, handleDeleteSection } = useGuide();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [editingChapter, setEditingChapter] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [chapterData, setChapterData] = useState({ title: '', content: '' });
  const [sectionData, setSectionData] = useState({ title: '' });
  const [lastSectionCount, setLastSectionCount] = useState(0);
  const [sectionBlockCounts, setSectionBlockCounts] = useState({});
  const [newBlockId, setNewBlockId] = useState(null);

  // Find chapter index for numbering
  const chapterIndex = guideData?.chapters?.findIndex(ch => ch.id === chapter?.id) ?? -1;

  // Collapse all sections when chapter changes
  useEffect(() => {
    setExpandedSections(new Set());
  }, [chapter?.id]);

  // פתיחה אוטומטית של עריכה כאשר נוסף סעיף חדש
  useEffect(() => {
    if (chapter?.sections && chapter.sections.length > lastSectionCount && lastSectionCount > 0) {
      // נוסף סעיף חדש - פתח אותו לעריכה
      const newSection = chapter.sections[chapter.sections.length - 1];
      setEditingSection(newSection.id);
      setSectionData({ title: newSection.title });
      // הרחב את הסעיף החדש
      setExpandedSections(prev => new Set([...prev, newSection.id]));
    }
    setLastSectionCount(chapter?.sections?.length || 0);
  }, [chapter?.sections?.length]);

  // מעקב אחרי בלוקים חדשים בכל סעיף
  useEffect(() => {
    if (!chapter?.sections) return;
    
    const newCounts = {};
    chapter.sections.forEach(section => {
      const currentCount = section.contentBlocks?.length || 0;
      const previousCount = sectionBlockCounts[section.id] || 0;
      
      if (currentCount > previousCount) {
        // נוסף בלוק חדש לסעיף זה (כולל הבלוק הראשון)
        const newBlock = section.contentBlocks[section.contentBlocks.length - 1];
        setNewBlockId(newBlock.id);
        // הרחב את הסעיף אם הוא לא מורחב
        setExpandedSections(prev => new Set([...prev, section.id]));
        // נקה את המזהה החדש אחרי רגע
        setTimeout(() => setNewBlockId(null), 100);
      }
      
      newCounts[section.id] = currentCount;
    });
    
    setSectionBlockCounts(newCounts);
  }, [chapter?.sections]);

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
      title: section.title
    });
  };

  const handleSaveSection = () => {
    // רק שמירת title, בלי content
    handleUpdateSection(chapter.id, editingSection, { title: sectionData.title });
    setEditingSection(null);
  };

  const handleCancelSectionEdit = () => {
    setEditingSection(null);
    setSectionData({ title: '' });
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
            {isEditMode && (
              <button className="chapter-edit-button" onClick={handleEditChapter} title="ערוך פרק">
                <Edit />
              </button>
            )}
            <div className="header-text">
              <h1>{chapter.title}</h1>
              {chapter.content && (
                <p className="chapter-content">{chapter.content}</p>
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
                    onChange={(e) => setSectionData({ title: e.target.value })}
                    className="edit-input title-input"
                    placeholder="כותרת הסעיף"
                    autoFocus
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
                    <span>{section.title}</span>
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
              
              {/* Section Content and Content Blocks - Only visible when expanded */}
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
                    isNewBlock={block.id === newBlockId}
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
                        <TextFormatting />
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף תמונה"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'image')}
                      >
                        <Image />
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף וידאו"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'video')}
                      >
                        <Video />
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף GIF"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'gif')}
                      >
                        <Gif />
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף קישור"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'link')}
                      >
                        <Link />
                      </button>
                      <button 
                        className="add-block-button" 
                        title="הוסף טופס"
                        onClick={() => handleAddContentBlock(chapter.id, section.id, 'form')}
                      >
                        <Form />
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