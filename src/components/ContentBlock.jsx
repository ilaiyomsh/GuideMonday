import React, { useState, useEffect, useRef } from 'react';
import { useGuide } from '../context/GuideContext';
import { MoveArrowUp, MoveArrowDown, Delete, Edit } from '@vibe/icons';
import ContentBlockEditDialog from './ContentBlockEditDialog';
import DOMPurify from 'dompurify';
import { getBlockTypeName, getBlockTypeIcon, getBlockTypePlaceholder } from '../constants/blockTypes';

export default function ContentBlock({ block, isEditMode, chapterId, sectionId, blockIndex, totalBlocks, isNewBlock }) {
  const { handleDeleteContentBlock, handleReorderContentBlock, direction } = useGuide();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const prevIsNewBlockRef = useRef(false);
  const hasOpenedOnceRef = useRef(false);

  // אפס את ה-ref כשמשנים בלוק
  useEffect(() => {
    hasOpenedOnceRef.current = false;
    prevIsNewBlockRef.current = false;
  }, [block.id]);

  // פתיחה אוטומטית של דיאלוג עריכה לבלוק חדש
  // רץ רק כש-isNewBlock משתנה מ-false ל-true (בלוק חדש נוצר)
  useEffect(() => {
    // פתח את הדיאלוג רק אם:
    // 1. במצב עריכה
    // 2. isNewBlock=true והערך הקודם היה false (בלוק חדש באמת נוצר)
    // 3. לא נפתח כבר פעם אחת (למנוע פתיחה חוזרת)
    if (isEditMode && isNewBlock && !prevIsNewBlockRef.current && !hasOpenedOnceRef.current) {
      console.log('📝 פותח דיאלוג עריכה לבלוק חדש:', block.type);
      setIsEditDialogOpen(true);
      hasOpenedOnceRef.current = true;
    }
    // עדכן את הערך הקודם
    prevIsNewBlockRef.current = isNewBlock;
  }, [isNewBlock, isEditMode, block.type, block.id]);

  const getFontSize = (size) => {
    return `${size}px`;
  };

  const renderTextWithFormatting = (data) => {
    if (!data.text) return '';
    
    let text = data.text;
    
    // Handle bullet list
    if (data.bulletList) {
      text = text.split('\n').map(line => line.trim() ? `• ${line}` : line).join('\n');
    }
    
    // Handle numbered list
    if (data.numberedList) {
      text = text.split('\n').map((line, index) => {
        if (line.trim()) {
          return `${index + 1}. ${line}`;
        }
        return line;
      }).join('\n');
    }
    
    return text;
  };

  const renderVideoContent = (data) => {
    // Check if we have embed code (new format)
    if (data.embedCode) {
      return <div dangerouslySetInnerHTML={{ __html: data.embedCode }} />;
    }
    
    // Fallback to URL format (direct video file)
    if (data.url) {
      // Check if it's a direct video file URL (not YouTube/Vimeo embed)
      const isDirectVideoFile = data.url.match(/\.(mp4|avi|mov|wmv|webm|ogg)(\?.*)?$/i);
      
      if (isDirectVideoFile) {
        return (
          <video 
            controls 
            className="video-preview"
          >
            <source src={data.url} type="video/mp4" />
            <source src={data.url} type="video/webm" />
            <source src={data.url} type="video/ogg" />
            הדפדפן שלכם לא תומך בתגית הוידאו.
          </video>
        );
      } else {
        // For YouTube/Vimeo URLs, use iframe
        return (
          <iframe 
            src={data.url} 
            title={data.title || 'Video'} 
            frameBorder="0" 
            loading="lazy"
            allowFullScreen 
          />
        );
      }
    }
    
    return <div>No video content available</div>;
  };

  const renderGifContent = (data) => {
    // Check if we have embed code (new format)
    if (data.embedCode) {
      try {
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.embedCode;
        
        // Extract the image and text
        const imgElement = tempDiv.querySelector('img');
        const textElement = tempDiv.querySelector('p');
        
        if (imgElement) {
          return (
            <div className="gif-content">
              {textElement && <p className="gif-text">{textElement.textContent}</p>}
              <img 
                src={imgElement.src} 
                alt={imgElement.alt || 'GIF Preview'}
                className="gif-preview"
              />
            </div>
          );
        }
        
        // Fallback: render as plain HTML if parsing fails
        return <div dangerouslySetInnerHTML={{ __html: data.embedCode }} />;
      } catch (error) {
        console.error('Error parsing GIF embed code:', error);
        // Fallback: render as plain HTML
        return <div dangerouslySetInnerHTML={{ __html: data.embedCode }} />;
      }
    }
    
    // Fallback to URL format (direct image)
    if (data.url) {
      return (
        <div className="gif-content">
          <img 
            src={data.url} 
            alt={data.caption || 'GIF'} 
            loading="lazy"
            className="gif-preview"
          />
        </div>
      );
    }
    
    return <div>No GIF content available</div>;
  };

  const isBlockEmpty = () => {
    switch (block.type) {
      case 'text':
        const htmlContent = block.data?.content || block.data?.text || '';
        return !htmlContent || htmlContent.trim() === '' || htmlContent.trim() === '<p></p>';
      case 'image':
        return !block.data?.url || block.data.url.trim() === '';
      case 'video':
        return (!block.data?.url && !block.data?.embedCode) || 
               (block.data.url && block.data.url.trim() === '') ||
               (block.data.embedCode && block.data.embedCode.trim() === '');
      case 'gif':
        return (!block.data?.url && !block.data?.embedCode) || 
               (block.data.url && block.data.url.trim() === '') ||
               (block.data.embedCode && block.data.embedCode.trim() === '');
      case 'link':
        return !block.data?.url || block.data.url.trim() === '';
      case 'form':
        return !block.data?.embedCode || block.data.embedCode.trim() === '';
      default:
        return true;
    }
  };

  const getPlaceholderText = () => {
    const icon = getBlockTypeIcon(block.type);
    const typeName = getBlockTypeName(block.type);
    const placeholder = getBlockTypePlaceholder(block.type);
    
    return (
      <div className="block-placeholder">
        <div className="placeholder-icon">{icon}</div>
        <p className="placeholder-title">בלוק {typeName}</p>
        <p className="placeholder-description">{placeholder}</p>
      </div>
    );
  };

  const renderContent = () => {
    // If block is empty, show placeholder
    if (isBlockEmpty()) {
      return getPlaceholderText();
    }

    switch (block.type) {
      case 'text':
        const htmlContent = block.data.content || block.data.text || '';
        const sanitizedHTML = DOMPurify.sanitize(htmlContent);
        return (
          <div 
            className="text-content rich-text-content"
            dir={direction}
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        );
      case 'image':
        return (
          <div className="block-media-wrapper">
            <div className="block-image">
              <img 
                src={block.data.url} 
                alt={block.data.caption || 'תמונה'} 
                loading="lazy"
              />
              {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="block-media-wrapper">
            <div className="block-video">
              <div className="video-container">
                {renderVideoContent(block.data)}
              </div>
            </div>
          </div>
        );
      case 'gif':
        return (
          <div className="block-media-wrapper">
            <div className="block-gif">
              <div className="gif-embed">
                {renderGifContent(block.data)}
              </div>
              {block.data.caption && (
                <p className="gif-caption">{block.data.caption}</p>
              )}
            </div>
          </div>
        );
      case 'link':
        return (
          <a href={block.data.url} target="_blank" rel="noopener noreferrer">
            {block.data.displayText}
          </a>
        );
      case 'form':
        return (
          <div className="block-form">
            {block.data.title && (
              <h3 className="form-title">{block.data.title}</h3>
            )}
            <div 
              className="form-embed"
              dangerouslySetInnerHTML={{ __html: block.data.embedCode }}
            />
          </div>
        );
      case 'code':
        return (
          <div className="block-code">
            <pre><code>{block.data.code}</code></pre>
          </div>
        );
      default:
        return <div>Unsupported block type</div>;
    }
  };

  return (
    <div 
      className={`content-block block-${block.type}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Controls */}
      {isEditMode && isHovered && (
        <div className="block-controls">
          <button 
            className="control-button edit" 
            title="ערוך בלוק"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit />
          </button>
          <button 
            className="control-button move-up" 
            title="העבר למעלה"
            onClick={() => handleReorderContentBlock(chapterId, sectionId, blockIndex, 'up')}
            disabled={blockIndex === 0}
          >
            <MoveArrowUp />
          </button>
          <button 
            className="control-button move-down" 
            title="העבר למטה"
            onClick={() => handleReorderContentBlock(chapterId, sectionId, blockIndex, 'down')}
            disabled={blockIndex === totalBlocks - 1}
          >
            <MoveArrowDown />
          </button>
          <button 
            className="control-button delete" 
            title="מחק"
            onClick={async () => {
              const isMediaBlock = ['image', 'video', 'gif'].includes(block.type);
              const hasMediaFile = block.data?.mediaItemId;
              
              let confirmMessage = 'האם למחוק בלוק זה?';
              if (isMediaBlock && hasMediaFile) {
                confirmMessage += '\n\nהקובץ יימחק גם מלוח המדיה.';
              }
              
              if (window.confirm(confirmMessage)) {
                await handleDeleteContentBlock(chapterId, sectionId, block.id);
              }
            }}
          >
            <Delete />
          </button>
        </div>
      )}

      {renderContent()}
      
      {/* Edit Dialog */}
      <ContentBlockEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        block={block}
        chapterId={chapterId}
        sectionId={sectionId}
        blockIndex={blockIndex}
      />
    </div>
  );
}