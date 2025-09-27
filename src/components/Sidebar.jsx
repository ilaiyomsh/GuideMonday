import React from 'react';
import { useGuide } from '../context/GuideContext';

// Props are minimal. 'guideData' is now sourced from the context.
export default function Sidebar({ onNavigate, activePageId }) {
  const { guideData } = useGuide();

  if (!guideData || !guideData.chapters) {
    return <aside className="sidebar">Loading...</aside>;
  }

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li
            className={!activePageId ? 'active' : ''}
            onClick={() => onNavigate('home')}
          >
            Home
          </li>
          {guideData.chapters.map(chapter => (
            <li
              key={chapter.id}
              className={activePageId === chapter.id ? 'active' : ''}
              onClick={() => onNavigate('chapter', chapter.id)}
            >
              {chapter.title}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}