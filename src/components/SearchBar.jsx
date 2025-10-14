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
  const triggerButtonRef = useRef(null);
  const inputRef = useRef(null);

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

  // קיצורי מקלדת לפתיחת/סגירת החיפוש
  useEffect(() => {
    const onKeyDown = (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/';
      const isEsc = e.key === 'Escape';

      if (!isSearchOpen && (isCmdK || isSlash)) {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      } else if (isSearchOpen && isEsc) {
        e.preventDefault();
        setIsSearchOpen(false);
        setSearchTerm('');
        setSearchResults([]);
        triggerButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen]);

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
    if (!fuse) return;
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    // דיבאונס פשוט
    clearTimeout(handleSearch._t);
    handleSearch._t = setTimeout(() => {
      const results = fuse.search(term);
      setSearchResults(results.slice(0, 10));
    }, 200);
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
        onClick={() => {
          setIsSearchOpen(!isSearchOpen);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        title="חיפוש במדריך"
        aria-label="חיפוש במדריך"
        aria-expanded={isSearchOpen}
        aria-controls="search-panel"
        ref={triggerButtonRef}
      >
        <Search />
      </button>
      
      {isSearchOpen && (
        <div className="search-panel" id="search-panel" role="dialog" aria-modal="false">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="חפשו פרק או סעיף…"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              ref={inputRef}
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  inputRef.current?.focus();
                }}
                aria-label="נקה חיפוש"
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

