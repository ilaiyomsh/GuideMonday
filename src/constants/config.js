/**
 * Application configuration constants
 */

// Text direction for Hebrew
export const TEXT_DIRECTION = 'rtl';

// Monday.com board and column IDs for file uploads
export const MONDAY_CONFIG = {
  BOARD_ID: '9265392875',
  FILE_COLUMN_ID: 'file_mkw7h32e'
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  ACCEPTED_GIF_TYPES: ['image/gif']
};

// Storage configuration
export const STORAGE_KEYS = {
  GUIDE_DATA: 'guideData'
};

// API configuration
export const API_CONFIG = {
  VERSION: '2023-10',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 500
};
