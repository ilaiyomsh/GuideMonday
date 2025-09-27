import React, { useState } from "react";
import EditForm from "./EditForm";

const HomePage = ({ homePageData, chapters, onNavigate, isEditMode, onUpdateHomePage, onUpdateChapter, onDeleteChapter, onReorderChapter, onAddChapter }) => {
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingHomePage, setEditingHomePage] = useState(false);

  const handleEditHomePage = () => {
    setEditingHomePage(true);
  };

  const handleSaveHomePage = (updatedData) => {
    onUpdateHomePage(updatedData);
    setEditingHomePage(false);
  };

  const handleEditChapter = (chapter, e) => {
    e.stopPropagation();
    setEditingChapter(chapter);
  };

  const handleSaveChapter = (updatedData) => {
    onUpdateChapter(editingChapter.id, updatedData);
    setEditingChapter(null);
  };

  const handleDeleteChapter = (chapterId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      onDeleteChapter(chapterId);
    }
  };

  const handleReorderChapter = (index, direction, e) => {
    e.stopPropagation();
    onReorderChapter(index, direction);
  };

  const handleAddChapter = () => {
    onAddChapter();
  };

  return (
    <div className="homepage">
      <div className="welcome-section">
        {isEditMode && (
          <div className="home-edit-controls">
            <button
              onClick={handleEditHomePage}
              className="edit-btn home-edit-btn"
              title="Edit home page content"
            >
              ✏️ Edit Home Page
            </button>
          </div>
        )}
        <h1 className="welcome-title">{homePageData.title}</h1>
        <p className="welcome-content">{homePageData.content}</p>
        {isEditMode && (
          <div className="add-chapter-container">
            <button onClick={handleAddChapter} className="add-btn add-chapter-btn">
              ➕ Add New Chapter
            </button>
          </div>
        )}
      </div>

      <div className="chapters-grid">
        {chapters.map((chapter, index) => (
          <div 
            key={chapter.id} 
            className="chapter-card"
            onClick={() => !isEditMode && onNavigate('chapter', chapter.id)}
          >
            {isEditMode && (
              <div className="item-controls">
                <div className="reorder-controls">
                  <button
                    onClick={(e) => handleReorderChapter(index, 'up', e)}
                    className="reorder-btn"
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => handleReorderChapter(index, 'down', e)}
                    className="reorder-btn"
                    disabled={index === chapters.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
                <button
                  onClick={(e) => handleEditChapter(chapter, e)}
                  className="edit-btn"
                  title="Edit chapter"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => handleDeleteChapter(chapter.id, e)}
                  className="delete-btn"
                  title="Delete chapter"
                >
                  🗑️
                </button>
              </div>
            )}
            <h3 className="chapter-title">{chapter.title}</h3>
            <p className="chapter-content">{chapter.content}</p>
            <div className="chapter-footer">
              <span className="chapter-sections-count">
                {chapter.sections.length} sections
              </span>
            </div>
          </div>
        ))}
      </div>

      {editingChapter && (
        <EditForm
          entityData={{
            title: editingChapter.title,
            content: editingChapter.content
          }}
          entityType="chapter"
          onSave={handleSaveChapter}
          onCancel={() => setEditingChapter(null)}
        />
      )}

      {editingHomePage && (
        <EditForm
          entityData={{
            title: homePageData.title,
            content: homePageData.content
          }}
          entityType="homePage"
          onSave={handleSaveHomePage}
          onCancel={() => setEditingHomePage(false)}
        />
      )}
    </div>
  );
};

export default HomePage;
