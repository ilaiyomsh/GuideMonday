import React, { useState } from 'react';
import { useGuide } from '../context/GuideContext';
import { MoveArrowUp, MoveArrowDown, Delete, Edit } from '@vibe/icons';
import ContentBlockEditDialog from './ContentBlockEditDialog';
import DOMPurify from 'dompurify';

export default function ContentBlock({ block, isEditMode, chapterId, sectionId, blockIndex, totalBlocks }) {
  const { handleDeleteContentBlock, handleReorderContentBlock } = useGuide();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    
    // Fallback to old format (URL + title)
    if (data.url) {
      return (
        <iframe 
          src={data.url} 
          title={data.title || 'Video'} 
          frameBorder="0" 
          allowFullScreen 
        />
      );
    }
    
    return <div>No video content available</div>;
  };

  const renderGifContent = (embedCode) => {
    if (!embedCode) return null;
    
    try {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = embedCode;
      
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
              style={{ maxWidth: '300px' }}
              className="gif-preview"
            />
          </div>
        );
      }
      
      // Fallback: render as plain HTML if parsing fails
      return <div dangerouslySetInnerHTML={{ __html: embedCode }} />;
    } catch (error) {
      console.error('Error parsing GIF embed code:', error);
      // Fallback: render as plain HTML
      return <div dangerouslySetInnerHTML={{ __html: embedCode }} />;
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        const htmlContent = block.data.content || block.data.text || '';
        const sanitizedHTML = DOMPurify.sanitize(htmlContent);
        return (
          <div 
            className="text-content rich-text-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        );
      case 'image':
        return (
          <div className="block-image">
            <img src={block.data.url} alt={block.data.caption} />
            {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
          </div>
        );
      case 'video':
        return (
          <div className="block-video">
            <div className="video-container">
              {renderVideoContent(block.data)}
            </div>
          </div>
        );
      case 'gif':
        return (
          <div className="block-gif">
            <div className="gif-embed">
              {renderGifContent(block.data.embedCode)}
            </div>
            {block.data.caption && (
              <p className="gif-caption">{block.data.caption}</p>
            )}
          </div>
        );
      case 'link':
        return (
          <a href={block.data.url} target="_blank" rel="noopener noreferrer">
            {block.data.displayText}
          </a>
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
            onClick={() => handleDeleteContentBlock(chapterId, sectionId, block.id)}
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