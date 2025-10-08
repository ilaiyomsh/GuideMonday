import React, { useState, useEffect, useRef } from 'react';
import { useGuide } from '../context/GuideContext';
import { Search, Close } from '@vibe/icons';
import Fuse from 'fuse.js';

export default function SearchBar({ onNavigate }) {
  const { guideData } = useGuide();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fuse, setFuse] = useState(null);
  const searchRef = useRef(null);

  // סגירת החיפוש בלחיצה מחוץ לקומפוננטה
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // בניית אינדקס חיפוש
  useEffect(() => {
    if (!guideData) return;
    
    const searchIndex = buildSearchIndex(guideData);
    const fuseInstance = new Fuse(searchIndex, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 }
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    });
    
    setFuse(fuseInstance);
  }, [guideData]);

  // פונקציה לבניית אינדקס
  const buildSearchIndex = (data) => {
    const index = [];
    
    // עמוד הבית
    if (data.homePage) {
      index.push({
        type: 'home',
        title: data.homePage.title || 'עמוד הבית',
        content: data.homePage.content || '',
        location: { page: 'home-page' }
      });
    }
    
    // פרקים וסעיפים
    data.chapters?.forEach((chapter, chapterIndex) => {
      // כותרת פרק
      index.push({
        type: 'chapter',
        title: chapter.title,
        content: chapter.content || '',
        location: { 
          page: 'chapter-page', 
          chapterId: chapter.id,
          chapterIndex 
        }
      });
      
      // סעיפים
      chapter.sections?.forEach((section, sectionIndex) => {
        index.push({
          type: 'section',
          title: section.title,
          content: section.content || '',
          chapterTitle: chapter.title,
          location: { 
            page: 'chapter-page', 
            chapterId: chapter.id,
            sectionId: section.id,
            chapterIndex,
            sectionIndex
          }
        });
        
        // בלוקי תוכן (רק טקסט)
        section.contentBlocks?.forEach((block, blockIndex) => {
          if (block.type === 'text' && block.data?.content) {
            // הסרת HTML tags
            const plainText = block.data.content.replace(/<[^>]*>/g, '');
            if (plainText.trim()) {
              index.push({
                type: 'block',
                title: `${section.title}`,
                content: plainText,
                chapterTitle: chapter.title,
                sectionTitle: section.title,
                location: { 
                  page: 'chapter-page', 
                  chapterId: chapter.id,
                  sectionId: section.id,
                  blockIndex
                }
              });
            }
          }
        });
      });
    });
    
    return index;
  };

  // חיפוש
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim() || !fuse) {
      setSearchResults([]);
      return;
    }
    
    const results = fuse.search(term);
    setSearchResults(results.slice(0, 10));
  };

  // ניווט לתוצאה
  const handleResultClick = (result) => {
    const location = result.item.location;
    
    if (location.page === 'home-page') {
      onNavigate('home-page');
    } else if (location.page === 'chapter-page') {
      onNavigate('chapter-page', location.chapterId);
      
      // גלילה לסעיף אם קיים
      if (location.sectionId) {
        setTimeout(() => {
          const element = document.getElementById(`section-${location.sectionId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // פתיחת הסעיף אם הוא סגור
            const button = element.querySelector('.section-toggle-button');
            const accordionContent = element.querySelector('.accordion-content');
            if (button && accordionContent && !accordionContent.classList.contains('open')) {
              button.click();
            }
          }
        }, 100);
      }
    }
    
    // סגירת החיפוש
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  // פונקציות עזר
  const getTypeLabel = (type) => {
    const labels = {
      home: 'עמוד הבית',
      chapter: 'פרק',
      section: 'סעיף',
      block: 'תוכן'
    };
    return labels[type] || type;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <button 
        className="search-trigger"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        title="חיפוש במדריך"
      >
        <Search />
      </button>
      
      {isSearchOpen && (
        <div className="search-panel">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="חיפוש במדריך..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                }}
              >
                <Close />
              </button>
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div 
                  key={index}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-header">
                    <span className="result-type">{getTypeLabel(result.item.type)}</span>
                    {result.item.chapterTitle && (
                      <span className="result-chapter">{result.item.chapterTitle}</span>
                    )}
                  </div>
                  <div className="result-title">{result.item.title}</div>
                  {result.item.content && (
                    <div className="result-content">
                      {truncateText(result.item.content, 100)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {searchTerm && searchResults.length === 0 && (
            <div className="search-no-results">
              לא נמצאו תוצאות עבור "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

