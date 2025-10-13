import React, { useState, useRef, useEffect } from 'react';

/**
 * קומפוננטת חיתוך תמונה מתקדמת
 * תומכת בזום, סיבוב, גרירה וחיתוך
 * 
 * @param {boolean} isOpen - האם המודל פתוח
 * @param {function} onClose - פונקציה לסגירת המודל
 * @param {function} onSave - פונקציה לשמירת התמונה (מקבלת base64 או blob)
 * @param {string} initialImage - תמונה התחלתית (אופציונלי)
 * @param {string} mode - 'logo' או 'mediaBoard' - קובע את אופן השמירה
 * @param {function} uploadToMediaBoard - פונקציה להעלאה ללוח מדיה (רק במצב mediaBoard)
 */
export default function ImageCropperModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialImage,
  mode = 'logo',
  uploadToMediaBoard = null
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowPreview(false);
      setPreviewBlob(null);
      if (initialImage) {
        handleImageLoad(initialImage);
      }
    } else {
      // Reset all state when closing
      setImageSrc(null);
      setOriginalImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setShowPreview(false);
      setPreviewBlob(null);
    }
  }, [isOpen, initialImage]);

  // Draw image on canvas whenever state changes
  useEffect(() => {
    if (originalImage && canvasRef.current) {
      drawImage();
    }
  }, [originalImage, zoom, rotation, crop]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    });

    if (!file.type.startsWith('image/')) {
      setUploadError('אנא בחר קובץ תמונה תקין');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('הקובץ גדול מדי. הגודל המקסימלי הוא 10MB');
      return;
    }

    // שמירת הקובץ המקורי למצב mediaBoard
    setSelectedFile(file);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      handleImageLoad(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = (src) => {
    console.log('📖 Loading image...');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('✅ Image loaded successfully');
      setOriginalImage(img);
      setImageSrc(src);
      setShowPreview(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    img.onerror = () => {
      console.error('❌ Failed to load image');
      alert('שגיאה בטעינת התמונה');
    };
    img.src = src;
  };

  const drawImage = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth || 500;
    const containerHeight = 350;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate image dimensions maintaining aspect ratio
    const containerAspect = canvas.width / canvas.height;
    const imageAspect = originalImage.width / originalImage.height;
    
    let drawWidth, drawHeight;
    if (imageAspect > containerAspect) {
      drawWidth = canvas.width * zoom;
      drawHeight = (canvas.width / imageAspect) * zoom;
    } else {
      drawWidth = (canvas.height * imageAspect) * zoom;
      drawHeight = canvas.height * zoom;
    }
    
    // Calculate position
    const x = (canvas.width / 2) - (drawWidth / 2) + crop.x;
    const y = (canvas.height / 2) - (drawHeight / 2) + crop.y;
    
    // Save context for rotation
    ctx.save();
    
    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // Draw image
    ctx.drawImage(originalImage, x, y, drawWidth, drawHeight);
    
    // Restore context
    ctx.restore();
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    setCrop(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setDragStart({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = async () => {
    if (!canvasRef.current || !originalImage) return;

    console.log('✂️ Cropping image...');
    
    // Create a new canvas for the cropped image with logo dimensions
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    // Set cropped canvas size to match logo area (200x150)
    const cropWidth = 200;
    const cropHeight = 150;
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    
    // Calculate the crop area position in the original canvas
    const originalCanvas = canvasRef.current;
    const cropX = (originalCanvas.width / 2) - (cropWidth / 2);
    const cropY = (originalCanvas.height / 2) - (cropHeight / 2);
    
    // Draw the cropped portion
    croppedCtx.drawImage(
      originalCanvas,
      cropX, cropY, cropWidth, cropHeight,  // source rectangle
      0, 0, cropWidth, cropHeight           // destination rectangle
    );
    
    // Get the cropped image as base64
    const croppedBase64 = croppedCanvas.toDataURL('image/png', 0.92);
    
    console.log('💾 Cropped image size:', croppedBase64.length, 'bytes');
    
    // Create preview
    const img = new Image();
    img.onload = () => {
      if (previewCanvasRef.current) {
        const previewCanvas = previewCanvasRef.current;
        const previewCtx = previewCanvas.getContext('2d');
        
        // Set preview size
        const maxSize = 300;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }
        
        previewCanvas.width = width;
        previewCanvas.height = height;
        
        // Draw preview
        previewCtx.clearRect(0, 0, width, height);
        previewCtx.drawImage(img, 0, 0, width, height);
      }
    };
    img.src = croppedBase64;
    
    setPreviewBlob(croppedBase64);
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;

    console.log('✂️ Creating cropped image...');
    
    // Create a new canvas for the cropped image with logo dimensions
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    // Set cropped canvas size to match logo area (200x150)
    const cropWidth = 200;
    const cropHeight = 150;
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    
    // Calculate the crop area position in the original canvas
    const originalCanvas = canvasRef.current;
    const cropX = (originalCanvas.width / 2) - (cropWidth / 2);
    const cropY = (originalCanvas.height / 2) - (cropHeight / 2);
    
    // Draw the cropped portion
    croppedCtx.drawImage(
      originalCanvas,
      cropX, cropY, cropWidth, cropHeight,  // source rectangle
      0, 0, cropWidth, cropHeight           // destination rectangle
    );
    
    // Get the cropped image as base64
    const croppedBase64 = croppedCanvas.toDataURL('image/png', 0.92);
    
    console.log('💾 Cropped image size:', croppedBase64.length, 'bytes');

    if (mode === 'logo') {
      // מצב לוגו - שמירה ישירה של base64
      console.log('✅ Saving logo as base64...');
      onSave(croppedBase64);
      onClose();
    } else if (mode === 'mediaBoard') {
      // מצב לוח מדיה - המרה ל-blob והעלאה
      if (!uploadToMediaBoard) {
        console.error('❌ uploadToMediaBoard function not provided');
        setUploadError('שגיאה: פונקציית העלאה לא זמינה');
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        console.log('🚀 Converting cropped image to blob...');
        
        // המרת base64 ל-blob
        const response = await fetch(croppedBase64);
        const blob = await response.blob();
        
        // יצירת File object מה-blob
        const croppedFile = new File(
          [blob], 
          selectedFile?.name || 'cropped-image.png',
          { type: 'image/png' }
        );

        console.log('📤 Uploading to media board...', {
          name: croppedFile.name,
          size: croppedFile.size,
          type: croppedFile.type
        });

        // העלאה ללוח המדיה
        const result = await uploadToMediaBoard(croppedFile);
        
        console.log('✅ Upload successful:', result);
        
        // קריאה ל-onSave עם התוצאה (URL + itemId)
        onSave(result);
        onClose();
      } catch (error) {
        console.error('❌ Upload failed:', error);
        setUploadError('שגיאה בהעלאת התמונה. אנא נסה שוב.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleImageLoad(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  // תצוגת תיבה ראשונה - בחירת תמונה
  if (!originalImage) {
    return (
      <div 
        className="upload-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="upload-modal upload-modal--profile"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="upload-modal-header profile-image-modal-header">
            <div className="header-content">
              <h1 className="modal-title">העלה תמונה עבור הלוגו</h1>
              
            </div>
            <button 
              className="close-modal-btn"
              onClick={onClose}
              aria-label="close"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path d="M6.331 5.27a.75.75 0 0 0-1.06 1.06L8.94 10l-3.67 3.668a.75.75 0 1 0 1.06 1.06L10 11.06l3.668 3.669a.75.75 0 0 0 1.06-1.06l-3.668-3.67 3.67-3.669a.75.75 0 0 0-1.061-1.06L10 8.939l-3.669-3.67Z"></path>
              </svg>
            </button>
          </div>
          
          <div className="upload-modal-body profile-modal-body">
            <div className="profile-image-modal">
              <div className="image-upload-component">
                <div className="upload-profile-picture">
                  {logoPreview && (
                    <img 
                      className="upload-profile-picture__img" 
                      src={logoPreview} 
                      alt="Profile" 
                    />
                  )}
                  <button 
                    className="btn btn--primary btn--upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" className="upload-icon">
                      <path d="M14.5285 7.3909C14.8225 7.09913 14.8244 6.62426 14.5326 6.33025L10.4055 2.17141C10.2647 2.02952 10.0731 1.94971 9.87316 1.94971C9.67325 1.94971 9.48162 2.02952 9.3408 2.17141L5.21373 6.33025C4.92197 6.62426 4.92379 7.09913 5.2178 7.3909C5.51181 7.68267 5.98668 7.68085 6.27845 7.38683L9.19554 4.44729L9.19554 12.484C9.19554 12.8982 9.53132 13.234 9.94554 13.234C10.3598 13.234 10.6955 12.8982 10.6955 12.484L10.6955 4.59317L13.4679 7.38683C13.7596 7.68085 14.2345 7.68267 14.5285 7.3909ZM3.5498 12.0188L3.5498 16.3423C3.55037 16.3438 3.55122 16.3457 3.55248 16.348C3.55683 16.356 3.56694 16.3705 3.58802 16.3871C3.63281 16.4225 3.71072 16.4532 3.80566 16.4494C3.81561 16.449 3.82556 16.4488 3.83552 16.4488L16.2641 16.4488C16.2739 16.4488 16.2837 16.449 16.2935 16.4494C16.3885 16.4531 16.4665 16.4224 16.5114 16.387C16.5325 16.3703 16.5427 16.3557 16.5471 16.3476C16.548 16.346 16.5486 16.3446 16.5492 16.3435C16.5494 16.3429 16.5496 16.3424 16.5498 16.3419V12.0188C16.5498 11.6046 16.8856 11.2688 17.2998 11.2688C17.714 11.2688 18.0498 11.6046 18.0498 12.0188V16.3812C18.0498 16.3957 18.0494 16.4102 18.0485 16.4247C18.0217 16.8858 17.7871 17.291 17.4408 17.5643C17.102 17.8318 16.6747 17.9617 16.2512 17.9488L3.84857 17.9488C3.42497 17.9619 2.99753 17.8321 2.65858 17.5645C2.31217 17.291 2.07751 16.8855 2.05104 16.4241C2.05022 16.4098 2.0498 16.3955 2.0498 16.3812V12.0188C2.0498 11.6046 2.38559 11.2688 2.7998 11.2688C3.21402 11.2688 3.5498 11.6046 3.5498 12.0188Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    העלה תמונה
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  {uploadError && (
                    <div className="upload-error">{uploadError}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // תצוגת תיבה שנייה - חיתוך תמונה
  return (
    <div 
      className="upload-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="upload-modal upload-modal--crop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="upload-modal-header crop-modal-title">
          <div className="header-content">
            <h1 className="modal-title">חתוך תמונה</h1>
          </div>
          <button 
            className="close-modal-btn"
            onClick={onClose}
            aria-label="close"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M6.331 5.27a.75.75 0 0 0-1.06 1.06L8.94 10l-3.67 3.668a.75.75 0 1 0 1.06 1.06L10 11.06l3.668 3.669a.75.75 0 0 0 1.06-1.06l-3.668-3.67 3.67-3.669a.75.75 0 0 0-1.061-1.06L10 8.939l-3.669-3.67Z"></path>
            </svg>
          </button>
        </div>
        
        <div className="upload-modal-body crop-modal-body">
          <div className="photo-upload-component photo-upload-button-modal-wrapper">
            <div className="croppie-container">
              <div className="cr-boundary">
                <canvas 
                  ref={canvasRef}
                  className="cr-image"
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                <div className="cr-viewport"></div>
                <div className="cr-overlay"></div>
              </div>
              <div className="cr-slider-wrap">
                <input 
                  className="cr-slider"
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.1" 
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="button-wrapper">
              <button 
                className="btn btn--tertiary"
                onClick={onClose}
                disabled={isUploading}
              >
                ביטול
              </button>
              <button 
                className="btn btn--primary btn--margin-left"
                onClick={handleSave}
                disabled={isUploading}
              >
                {isUploading ? 'מעלה...' : 'חתוך ושמור'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

