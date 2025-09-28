import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertFromHTML, ContentState } from 'draft-js';
import { Numbers, Bullets } from '@vibe/icons';
import 'draft-js/dist/Draft.css';

const DraftTextEditor = ({ initialContent = '', onChange, direction = 'rtl' }) => {
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      // Convert HTML to EditorState
      const blocksFromHTML = convertFromHTML(initialContent);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  const editorRef = useRef(null);

  // Handle editor changes
  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    if (onChange) {
      // Convert EditorState to HTML
      const contentState = newEditorState.getCurrentContent();
      const htmlContent = convertToHTML(contentState);
      onChange(htmlContent);
    }
  };

  // Convert ContentState to HTML
  const convertToHTML = (contentState) => {
    const blocks = contentState.getBlockMap();
    let html = '';
    
    blocks.forEach((block) => {
      const text = block.getText();
      const blockType = block.getType();
      
      if (text.trim()) {
        switch (blockType) {
          case 'header-one':
            html += `<h1>${text}</h1>`;
            break;
          case 'header-two':
            html += `<h2>${text}</h2>`;
            break;
          case 'header-three':
            html += `<h3>${text}</h3>`;
            break;
          case 'unordered-list-item':
            html += `<ul><li>${text}</li></ul>`;
            break;
          case 'ordered-list-item':
            html += `<ol><li>${text}</li></ol>`;
            break;
          case 'blockquote':
            html += `<blockquote>${text}</blockquote>`;
            break;
          default:
            html += `<p>${text}</p>`;
        }
      }
    });
    
    return html;
  };

  // Handle key commands
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Toolbar functions
  const onBoldClick = () => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  };

  const onItalicClick = () => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  };

  const onUnderlineClick = () => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  };

  const onBulletListClick = () => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, 'unordered-list-item'));
  };

  const onNumberedListClick = () => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, 'ordered-list-item'));
  };

  const onHeaderClick = (headerType) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, headerType));
  };

  // Focus editor when component mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <div className="draft-text-editor" dir={direction}>
      {/* Toolbar */}
      <div className="draft-toolbar">
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentInlineStyle().has('BOLD') ? 'active' : ''}`}
          onClick={onBoldClick}
          title="הדגשה"
        >
          <strong>B</strong>
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentInlineStyle().has('ITALIC') ? 'active' : ''}`}
          onClick={onItalicClick}
          title="הטיה"
        >
          <em>I</em>
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentInlineStyle().has('UNDERLINE') ? 'active' : ''}`}
          onClick={onUnderlineClick}
          title="קו תחתון"
        >
          <u>U</u>
        </button>
        
        <div className="toolbar-separator" />
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'unordered-list-item' ? 'active' : ''}`}
          onClick={onBulletListClick}
          title="רשימת נקודות"
        >
          <Bullets />
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'ordered-list-item' ? 'active' : ''}`}
          onClick={onNumberedListClick}
          title="רשימה ממוספרת"
        >
          <Numbers />
        </button>
        
        <div className="toolbar-separator" />
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'header-one' ? 'active' : ''}`}
          onClick={() => onHeaderClick('header-one')}
          title="כותרת 1"
        >
          H1
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'header-two' ? 'active' : ''}`}
          onClick={() => onHeaderClick('header-two')}
          title="כותרת 2"
        >
          H2
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'header-three' ? 'active' : ''}`}
          onClick={() => onHeaderClick('header-three')}
          title="כותרת 3"
        >
          H3
        </button>
      </div>
      
      {/* Editor */}
      <div className="draft-editor-container">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          placeholder="התחל להקליד..."
        />
      </div>
    </div>
  );
};

export default DraftTextEditor;
