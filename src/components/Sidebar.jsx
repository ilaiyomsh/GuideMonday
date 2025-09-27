import React from "react";

const Sidebar = ({ chapters, onNavigate, activePageId }) => {
  return (
    <div className="sidebar">
      <nav className="nav-menu">
        <div className="nav-item">
          <button
            onClick={() => onNavigate('home')}
            className={`nav-button ${activePageId === null ? 'active' : ''}`}
          >
            🏠 Home
          </button>
        </div>
        
        <div className="chapters-list">
          <h3 className="chapters-title">Chapters</h3>
          {chapters.map((chapter) => (
            <div key={chapter.id} className="nav-item">
              <button
                onClick={() => onNavigate('chapter', chapter.id)}
                className={`nav-button ${activePageId === chapter.id ? 'active' : ''}`}
              >
                {chapter.title}
              </button>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
