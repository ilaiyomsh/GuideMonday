import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertFromHTML, ContentState } from 'draft-js';
import { Numbers, Bullets, AlignLeft, AlignCenter, AlignRight, Text, TextBig, TextHuge } from '@vibe/icons';
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
      const textAlign = block.getData().get('textAlign');
      
      if (text.trim()) {
        const alignStyle = textAlign ? `text-align: ${textAlign};` : '';
        
        switch (blockType) {
          case 'header-one':
            html += `<p style="${alignStyle}font-size: 20px; font-weight: 600; line-height: 1.4;">${text}</p>`;
            break;
          case 'header-two':
            html += `<p style="${alignStyle}font-size: 16px; font-weight: 600; line-height: 1.4;">${text}</p>`;
            break;
          case 'header-three':
            html += `<p style="${alignStyle}font-size: 14px; font-weight: 600; line-height: 1.4;">${text}</p>`;
            break;
          case 'unordered-list-item':
            html += `<ul style="${alignStyle}"><li>${text}</li></ul>`;
            break;
          case 'ordered-list-item':
            html += `<ol style="${alignStyle}"><li>${text}</li></ol>`;
            break;
          case 'blockquote':
            html += `<blockquote style="${alignStyle}">${text}</blockquote>`;
            break;
          default:
            html += `<p style="${alignStyle}">${text}</p>`;
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

  const getCurrentTextAlign = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    return block.getData().get('textAlign') || 'right'; // ברירת מחדל יישור לימין
  };

  const onTextAlignClick = (align) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    
    // Create new block data with text alignment
    const newBlockData = block.getData().set('textAlign', align);
    const newContentState = contentState.mergeBlockData(blockKey, newBlockData);
    const newEditorState = EditorState.forceSelection(
      EditorState.createWithContent(newContentState),
      selection
    );
    
    handleEditorChange(newEditorState);
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
          className={`toolbar-button ${getCurrentTextAlign() === 'right' ? 'active' : ''}`}
          onClick={() => onTextAlignClick('right')}
          title="יישור לימין"
        >
          <AlignRight />
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${getCurrentTextAlign() === 'center' ? 'active' : ''}`}
          onClick={() => onTextAlignClick('center')}
          title="יישור למרכז"
        >
          <AlignCenter />
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${getCurrentTextAlign() === 'left' ? 'active' : ''}`}
          onClick={() => onTextAlignClick('left')}
          title="יישור לשמאל"
        >
          <AlignLeft />
        </button>
        
        <div className="toolbar-separator" />
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'header-one' ? 'active' : ''}`}
          onClick={() => onHeaderClick('header-one')}
          title="כותרת גדולה"
        >
          <TextHuge />
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'header-two' ? 'active' : ''}`}
          onClick={() => onHeaderClick('header-two')}
          title="כותרת בינונית"
        >
          <TextBig />
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'header-three' ? 'active' : ''}`}
          onClick={() => onHeaderClick('header-three')}
          title="כותרת קטנה"
        >
          <Text />
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
