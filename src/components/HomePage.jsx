import React from 'react';
import { useGuide } from '../context/GuideContext';
import EditForm from './EditForm'; // Assuming EditForm might be used here

// NOTICE: The only prop left is 'onNavigate' which is local to App's state
export default function HomePage({ onNavigate }) {
  // Get everything needed from the global context
  const {
    guideData,
    isEditMode,
    handleUpdateHomePage,
    handleUpdateChapter,
    handleDeleteChapter,
    handleReorderChapter,
    handleAddChapter
  } = useGuide();

  const { homePage, chapters } = guideData;

  if (!homePage) return <div>Loading home page...</div>;

  return (
    <div className="home-page">
      {isEditMode ? (
        <EditForm
          data={{ title: homePage.title, content: homePage.content }}
          onSave={(newData) => handleUpdateHomePage(newData)}
        />
      ) : (
        <header className="home-header">
          <h1>{homePage.title}</h1>
          <p>{homePage.content}</p>
        </header>
      )}

      <div className="chapter-list">
        <h2>Chapters</h2>
        {chapters && chapters.map((chapter, index) => (
          <div key={chapter.id} className="chapter-item">
            <h3 onClick={() => onNavigate('chapter', chapter.id)}>{chapter.title}</h3>
            {isEditMode && (
              <div className="edit-controls">
                <button onClick={() => handleDeleteChapter(chapter.id)}>Delete</button>
                <button onClick={() => handleReorderChapter(index, 'up')} disabled={index === 0}>Up</button>
                <button onClick={() => handleReorderChapter(index, 'down')} disabled={index === chapters.length - 1}>Down</button>
              </div>
            )}
          </div>
        ))}
        {isEditMode && (
          <button onClick={handleAddChapter} className="add-btn">
            + Add Chapter
          </button>
        )}
      </div>
    </div>
  );
}