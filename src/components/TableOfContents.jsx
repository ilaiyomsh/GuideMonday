import React, { useState, useEffect } from 'react';

export default function TableOfContents({ sections = [], chapterTitle = '' }) {
  const [activeSection, setActiveSection] = useState(null);

  const handleSectionClick = (sectionId) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      // Set active section immediately
      setActiveSection(sectionId);
      
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id^="section-"]');
      let currentSection = null;

      // Find the first section that is visible in the top part of the viewport
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        
        // Check if section is in the top 60% of the viewport
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom > 0) {
          currentSection = section.id.replace('section-', '');
          console.log('Active section:', currentSection, 'Section element:', section);
          break; // Take the first matching section
        }
      }

      setActiveSection(currentSection);
    };

    // Initial check with a small delay to ensure DOM is ready
    setTimeout(handleScroll, 100);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!sections || sections.length === 0) {
    return (
      <div className="table-of-contents">
        <div className="toc-header">
          <h3>{chapterTitle || 'תוכן עניינים'}</h3>
        </div>
        <div className="toc-content">
          <p className="toc-empty">אין סעיפים זמינים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-of-contents">
      <div className="toc-header">
        <h3>{chapterTitle || 'תוכן עניינים'}</h3>
      </div>
      <div className="toc-content">
        <ul className="toc-list">
          {sections.map((section) => (
            <li key={section.id} className="toc-item">
              <button 
                className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => handleSectionClick(section.id)}
                title={`עבור לסעיף: ${section.title}`}
              >
                <span className="toc-title">{section.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
