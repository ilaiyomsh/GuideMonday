import React, { useState } from 'react';
import { Dialog, DialogContentContainer, Button, TextField, TextArea, Flex, Heading, Divider } from '@vibe/core';
import { Close } from '@vibe/icons';

export default function BlockEditDialog({ isOpen, onClose, blockData, blockType, onSave }) {
  const [formData, setFormData] = useState(blockData || {});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const renderFields = () => {
    switch (blockType) {
      case 'image':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={20}>
            <TextField
              value={formData.url || ''}
              onChange={(value) => handleChange('url', value)}
              placeholder="https://example.com/image.jpg"
              title="Image URL"
              required
            />
            <TextField
              value={formData.caption || ''}
              onChange={(value) => handleChange('caption', value)}
              placeholder="Image description or caption"
              title="Caption"
            />
            {formData.url && (
              <div>
                <Heading type={Heading.types.H5} value="Preview:" />
                <img 
                  src={formData.url} 
                  alt={formData.caption || 'Preview'} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: 'var(--border-radius-medium)',
                    marginTop: '8px'
                  }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </Flex>
        );
      
      case 'video':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={20}>
            <TextField
              value={formData.embedUrl || ''}
              onChange={(value) => handleChange('embedUrl', value)}
              placeholder="https://www.youtube.com/embed/..."
              title="Video Embed URL"
              required
            />
            <TextField
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Video description"
              title="Description"
            />
            {formData.embedUrl && (
              <div>
                <Heading type={Heading.types.H5} value="Preview:" />
                <iframe 
                  src={formData.embedUrl} 
                  title={formData.description || 'Video preview'} 
                  frameBorder="0" 
                  allowFullScreen 
                  style={{
                    width: '100%', 
                    height: '200px',
                    borderRadius: 'var(--border-radius-medium)',
                    marginTop: '8px'
                  }}
                />
              </div>
            )}
          </Flex>
        );
      
      case 'link':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={20}>
            <TextField
              value={formData.url || ''}
              onChange={(value) => handleChange('url', value)}
              placeholder="https://example.com"
              title="URL"
              required
            />
            <TextField
              value={formData.displayText || ''}
              onChange={(value) => handleChange('displayText', value)}
              placeholder="Click here to visit"
              title="Display Text"
              required
            />
          </Flex>
        );
      
      case 'text':
      default:
        return (
          <TextArea
            value={formData.text || ''}
            onChange={(value) => handleChange('text', value)}
            placeholder="Enter your text content..."
            rows={6}
          />
        );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size={Dialog.sizes.MEDIUM}
      position={Dialog.positions.CENTER}
    >
      <DialogContentContainer>
        <Flex direction={Flex.directions.COLUMN} gap={24}>
          <Flex justify={Flex.justify.SPACE_BETWEEN} align={Flex.align.CENTER}>
            <Heading type={Heading.types.H3} value={`Edit ${blockType} block`} />
            <Button
              kind={Button.kinds.TERTIARY}
              size={Button.sizes.SMALL}
              onClick={onClose}
              ariaLabel="Close dialog"
            >
              <Close />
            </Button>
          </Flex>
          
          <Divider />
          
          {renderFields()}
          
          <Divider />
          
          <Flex gap={12} justify={Flex.justify.END}>
            <Button 
              kind={Button.kinds.TERTIARY} 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Save Changes
            </Button>
          </Flex>
        </Flex>
      </DialogContentContainer>
    </Dialog>
  );
}
