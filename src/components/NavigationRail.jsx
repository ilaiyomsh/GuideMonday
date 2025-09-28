import React from 'react';
import classnames from 'classnames';
import { useGuide } from '../context/GuideContext.jsx';
import { Heading } from '@vibe/core';

export default function NavigationRail({ activeChapterId, onNavigate }) {
  const { guideData } = useGuide();

  if (!guideData?.chapters) {
    return (
      <div className="sidebar-header">
        <Heading type={Heading.types.H2} value="Interactive Guide" />
      </div>
    );
  }
  
  const handleNavigateToChapter = (chapterId) => {
    onNavigate(chapterId);
  }

  return (
    <>
      <div className="sidebar-header">
        <Heading type={Heading.types.H2} value={guideData?.title || 'Interactive Guide'} />
      </div>
      <nav>
        <ul>
          {guideData.chapters.map((chapter, chapterIndex) => (
            <li key={chapter.id}>
              <div
                className={classnames('chapter-title', { active: chapter.id === activeChapterId })}
                onClick={() => handleNavigateToChapter(chapter.id)}
              >
                {chapterIndex + 1}. {chapter.title}
              </div>
              {chapter.sections && chapter.sections.length > 0 && chapter.id === activeChapterId && (
                <ul>
                  {chapter.sections.map((section, sectionIndex) => (
                    <li key={section.id}>
                      <a
                        href={`#section-${section.id}`}
                        className={classnames({ active: true })}
                        onClick={(e) => {
                          e.preventDefault();
                          // Section navigation within current chapter
                          const element = document.getElementById(`section-${section.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {chapterIndex + 1}.{sectionIndex + 1} {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}