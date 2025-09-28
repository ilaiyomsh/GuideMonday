import React, { useState } from "react";
import { Button, TextField, TextArea, Flex, Box, Heading } from '@vibe/core';

const EditForm = ({ data, type, onSave, onCancel }) => {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderFields = () => {
    switch (type) {
      case 'text':
        return (
          <TextArea
            value={formData.text || ''}
            onChange={(value) => handleChange('text', value)}
            placeholder="Enter text content..."
            rows={4}
          />
        );
      
      case 'image':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={16}>
            <TextField
              value={formData.url || ''}
              onChange={(value) => handleChange('url', value)}
              placeholder="Image URL"
              title="Image URL"
            />
            <TextField
              value={formData.caption || ''}
              onChange={(value) => handleChange('caption', value)}
              placeholder="Image caption"
              title="Caption"
            />
          </Flex>
        );
      
      case 'video':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={16}>
            <TextField
              value={formData.embedUrl || ''}
              onChange={(value) => handleChange('embedUrl', value)}
              placeholder="Video embed URL"
              title="Video URL"
            />
            <TextField
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Video description"
              title="Description"
            />
          </Flex>
        );
      
      case 'link':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={16}>
            <TextField
              value={formData.url || ''}
              onChange={(value) => handleChange('url', value)}
              placeholder="Link URL"
              title="URL"
            />
            <TextField
              value={formData.displayText || ''}
              onChange={(value) => handleChange('displayText', value)}
              placeholder="Display text"
              title="Display Text"
            />
          </Flex>
        );
      
      case 'homePage':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={16}>
            <TextField
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Home page title"
              title="Title"
            />
            <TextArea
              value={formData.content || ''}
              onChange={(value) => handleChange('content', value)}
              placeholder="Home page description"
              rows={4}
            />
          </Flex>
        );

      case 'chapter':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={16}>
            <TextField
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Chapter title"
              title="Title"
            />
            <TextArea
              value={formData.content || ''}
              onChange={(value) => handleChange('content', value)}
              placeholder="Chapter description"
              rows={3}
            />
          </Flex>
        );
      
      case 'section':
        return (
          <Flex direction={Flex.directions.COLUMN} gap={16}>
            <TextField
              value={formData.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Section title"
              title="Title"
            />
            <TextArea
              value={formData.content || ''}
              onChange={(value) => handleChange('content', value)}
              placeholder="Section content"
              rows={3}
            />
          </Flex>
        );
      
      default:
        return (
          <Box>
            <p>Unknown entity type: {type}</p>
          </Box>
        );
    }
  };

  return (
    <Box 
      padding={24} 
      border 
      rounded 
      backgroundColor={Box.backgroundColors.PRIMARY_BACKGROUND_COLOR}
    >
      <Flex direction={Flex.directions.COLUMN} gap={24}>
        <Heading type={Heading.types.H4} value={`Edit ${type}`} />
        
        <form onSubmit={handleSubmit}>
          <Flex direction={Flex.directions.COLUMN} gap={24}>
            {renderFields()}
            
            <Flex gap={12} justify={Flex.justify.END}>
              <Button 
                kind={Button.kinds.TERTIARY} 
                onClick={onCancel}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Box>
  );
};

export default EditForm;
