import React, { useState } from 'react';
import { useGuide } from '../context/GuideContext';
import { Edit, Add, MoveArrowUp, MoveArrowDown, Delete } from '@vibe/icons';

export default function HomePage({ onNavigate }) {
  const { guideData, styleData, isEditMode, handleUpdateHomePage, handleAddChapter, handleReorderChapter, handleDeleteChapter, handleUpdateChapter } = useGuide();
  const [isEditingHomePage, setIsEditingHomePage] = useState(false);
  const [homePageData, setHomePageData] = useState({
    title: guideData?.homePage?.title || 'ברוכים הבאים',
    content: guideData?.homePage?.content || ''
  });
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterData, setChapterData] = useState({ title: '', content: '' });

  if (!guideData) return <div>Loading home page...</div>;

  const handleChapterClick = (chapterId) => {
    onNavigate('chapter-page', chapterId);
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

  const handleAddNewChapter = () => {
    handleAddChapter();
  };

  const handleReorderChapterClick = (chapterIndex, direction, e) => {
    e.stopPropagation();
    handleReorderChapter(chapterIndex, direction);
  };

  const handleDeleteChapterClick = (chapterId, e) => {
    e.stopPropagation();
    if (window.confirm('האם אתם בטוחים שברצונכם למחוק את הפרק?')) {
      handleDeleteChapter(chapterId);
    }
  };

  const handleEditChapter = (chapter, e) => {
    e.stopPropagation();
    setEditingChapter(chapter.id);
    setChapterData({
      title: chapter.title,
      content: chapter.content || ''
    });
  };

  const handleSaveChapter = () => {
    if (editingChapter) {
      handleUpdateChapter(editingChapter, chapterData);
      setEditingChapter(null);
      setChapterData({ title: '', content: '' });
    }
  };

  const handleCancelChapterEdit = () => {
    setEditingChapter(null);
    setChapterData({ title: '', content: '' });
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
            {isEditMode && (
              <button className="home-edit-button" onClick={handleEditHomePage} title="ערוך כותרת ותיאור">
                <Edit />
              </button>
            )}
            <div className="header-text">
              <h1>{guideData.homePage?.title || 'ברוכים הבאים'}</h1>
              {guideData.homePage?.content && (
                <p className="home-content">{guideData.homePage.content}</p>
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
            {editingChapter === chapter.id ? (
              <div 
                className="chapter-edit-form"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={chapterData.title}
                  onChange={(e) => setChapterData({ ...chapterData, title: e.target.value })}
                  className="edit-input title-input"
                  placeholder="כותרת הפרק"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <textarea
                  value={chapterData.content}
                  onChange={(e) => setChapterData({ ...chapterData, content: e.target.value })}
                  className="edit-input content-input"
                  placeholder="תיאור הפרק"
                  rows="3"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="edit-buttons">
                  <button 
                    className="save-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveChapter();
                    }}
                  >
                    שמור
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelChapterEdit();
                    }}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isEditMode && (
                  <div className="chapter-controls">
                    <button 
                      className="chapter-edit-button"
                      onClick={(e) => handleEditChapter(chapter, e)}
                      title="ערוך פרק"
                    >
                      <Edit />
                    </button>
                    <button 
                      className="chapter-reorder-button"
                      onClick={(e) => handleReorderChapterClick(chapter.id, 'up', e)}
                      disabled={index === 0}
                      title="הזז למעלה"
                    >
                      <MoveArrowUp />
                    </button>
                    <button 
                      className="chapter-reorder-button"
                      onClick={(e) => handleReorderChapterClick(chapter.id, 'down', e)}
                      disabled={index === guideData.chapters.length - 1}
                      title="הזז למטה"
                    >
                      <MoveArrowDown />
                    </button>
                    <button 
                      className="chapter-delete-button"
                      onClick={(e) => handleDeleteChapterClick(chapter.id, e)}
                      title="מחק פרק"
                    >
                      <Delete />
                    </button>
                  </div>
                )}
                <h2>{chapter.title}</h2>
                <p>{chapter.description || chapter.content}</p>
              </>
            )}
          </div>
        ))}
        
        {/* כפתור הוספת פרק חדש - רק במצב עריכה */}
        {isEditMode && (
          <div 
            className="chapter-card add-chapter-card"
            onClick={handleAddNewChapter}
          >
            <div className="add-chapter-content">
              <div className="add-chapter-icon">
                <Add />
              </div>
              <h2>הוסף פרק חדש</h2>
              <p>לחץ כאן כדי ליצור פרק חדש במדריך</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}