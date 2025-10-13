// Image Upload & Crop Component JavaScript

class ImageCropper {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        // State
        this.imageSrc = null;
        this.originalImage = null;
        this.crop = { x: 0, y: 0 };
        this.zoom = 1;
        this.rotation = 0;
        this.croppedBlob = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        
        // Elements
        this.fileInput = document.getElementById('fileInput');
        this.cropContainer = document.getElementById('cropContainer');
        this.imageCanvas = document.getElementById('imageCanvas');
        this.cropBox = document.getElementById('cropBox');
        this.controls = document.getElementById('controls');
        this.zoomSlider = document.getElementById('zoomSlider');
        this.rotationSlider = document.getElementById('rotationSlider');
        this.zoomValue = document.getElementById('zoomValue');
        this.rotationValue = document.getElementById('rotationValue');
        this.confirmCrop = document.getElementById('confirmCrop');
        this.previewSection = document.getElementById('previewSection');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.downloadCrop = document.getElementById('downloadCrop');
        
        // Canvas context
        this.ctx = this.imageCanvas.getContext('2d');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        // Add demo functionality for testing
        this.addDemoFeature();
    }

    setupEventListeners() {
        // File input with multiple event types for better compatibility
        this.fileInput.addEventListener('change', (e) => this.onSelectFile(e));
        this.fileInput.addEventListener('input', (e) => this.onSelectFile(e));
        
        // Controls
        this.zoomSlider.addEventListener('input', (e) => this.onZoomChange(e));
        this.rotationSlider.addEventListener('input', (e) => this.onRotationChange(e));
        this.confirmCrop.addEventListener('click', () => this.onConfirmCrop());
        this.downloadCrop.addEventListener('click', () => this.onDownloadCrop());
        
        // Image dragging
        this.imageCanvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        // Touch events for mobile
        this.imageCanvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', () => this.onTouchEnd());
        
        // Prevent default drag behavior
        this.imageCanvas.addEventListener('dragstart', (e) => e.preventDefault());
    }

    addDemoFeature() {
        // Add a demo button to test functionality without file upload
        const demoButton = document.createElement('button');
        demoButton.textContent = 'Load Demo Image';
        demoButton.className = 'btn btn--secondary';
        demoButton.style.marginLeft = '10px';
        demoButton.addEventListener('click', () => this.loadDemoImage());
        
        const fileInputContainer = this.fileInput.parentElement;
        fileInputContainer.appendChild(demoButton);
    }

    async loadDemoImage() {
        try {
            // Create a demo image using canvas
            const demoCanvas = document.createElement('canvas');
            demoCanvas.width = 400;
            demoCanvas.height = 300;
            const demoCtx = demoCanvas.getContext('2d');
            
            // Create gradient background
            const gradient = demoCtx.createLinearGradient(0, 0, 400, 300);
            gradient.addColorStop(0, '#1FB8CD');
            gradient.addColorStop(0.5, '#FFC185');
            gradient.addColorStop(1, '#B4413C');
            
            demoCtx.fillStyle = gradient;
            demoCtx.fillRect(0, 0, 400, 300);
            
            // Add demo text
            demoCtx.fillStyle = '#FFFFFF';
            demoCtx.font = 'bold 24px Arial';
            demoCtx.textAlign = 'center';
            demoCtx.fillText('Demo Image', 200, 150);
            demoCtx.font = '16px Arial';
            demoCtx.fillText('Ready for Cropping!', 200, 180);
            
            // Convert to blob and process
            demoCanvas.toBlob((blob) => {
                this.imageSrc = URL.createObjectURL(blob);
                this.loadImage(this.imageSrc).then((img) => {
                    this.originalImage = img;
                    this.showCropInterface();
                    this.drawImage();
                });
            });
            
        } catch (error) {
            console.error('Error creating demo image:', error);
            this.showError('Failed to load demo image.');
        }
    }

    async onSelectFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB.');
            return;
        }

        try {
            this.imageSrc = URL.createObjectURL(file);
            this.originalImage = await this.loadImage(this.imageSrc);
            this.showCropInterface();
            this.drawImage();
        } catch (error) {
            console.error('Error loading image:', error);
            this.showError('Failed to load image. Please try again.');
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    showCropInterface() {
        this.cropContainer.classList.remove('hidden');
        this.controls.classList.remove('hidden');
        this.previewSection.classList.add('hidden');
        
        // Reset values
        this.crop = { x: 0, y: 0 };
        this.zoom = 1;
        this.rotation = 0;
        this.zoomSlider.value = 1;
        this.rotationSlider.value = 0;
        this.updateSliderValues();
    }

    drawImage() {
        if (!this.originalImage) return;

        const canvas = this.imageCanvas;
        const ctx = this.ctx;
        
        // Set canvas size to container size
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth || 400;
        const containerHeight = container.clientHeight || 400;
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate image dimensions maintaining aspect ratio
        const containerAspect = canvas.width / canvas.height;
        const imageAspect = this.originalImage.width / this.originalImage.height;
        
        let drawWidth, drawHeight;
        if (imageAspect > containerAspect) {
            drawWidth = canvas.width * this.zoom;
            drawHeight = (canvas.width / imageAspect) * this.zoom;
        } else {
            drawWidth = (canvas.height * imageAspect) * this.zoom;
            drawHeight = canvas.height * this.zoom;
        }
        
        // Calculate position
        const x = (canvas.width / 2) - (drawWidth / 2) + this.crop.x;
        const y = (canvas.height / 2) - (drawHeight / 2) + this.crop.y;
        
        // Save context for rotation
        ctx.save();
        
        // Apply rotation if needed
        if (this.rotation !== 0) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(this.getRadianAngle(this.rotation));
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }
        
        // Draw image
        ctx.drawImage(this.originalImage, x, y, drawWidth, drawHeight);
        
        // Restore context
        ctx.restore();
    }

    getRadianAngle(deg) {
        return (deg * Math.PI) / 180;
    }

    onZoomChange(e) {
        this.zoom = parseFloat(e.target.value);
        this.updateSliderValues();
        this.drawImage();
    }

    onRotationChange(e) {
        this.rotation = parseInt(e.target.value);
        this.updateSliderValues();
        this.drawImage();
    }

    updateSliderValues() {
        this.zoomValue.textContent = this.zoom.toFixed(1);
        this.rotationValue.textContent = this.rotation;
    }

    onMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        const rect = this.imageCanvas.getBoundingClientRect();
        this.dragStart = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        this.imageCanvas.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const rect = this.imageCanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const deltaX = currentX - this.dragStart.x;
        const deltaY = currentY - this.dragStart.y;
        
        this.crop.x += deltaX;
        this.crop.y += deltaY;
        
        this.dragStart.x = currentX;
        this.dragStart.y = currentY;
        
        this.drawImage();
    }

    onMouseUp() {
        this.isDragging = false;
        this.imageCanvas.style.cursor = 'grab';
    }

    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.onMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {}
        });
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.onMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }

    onTouchEnd() {
        this.onMouseUp();
    }

    async onConfirmCrop() {
        if (!this.originalImage) return;

        try {
            this.confirmCrop.textContent = 'Processing...';
            this.confirmCrop.disabled = true;
            
            const croppedBlob = await this.getCroppedBlob();
            if (croppedBlob) {
                this.croppedBlob = croppedBlob;
                this.showPreview(croppedBlob);
            }
        } catch (error) {
            console.error('Error cropping image:', error);
            this.showError('Failed to crop image. Please try again.');
        } finally {
            this.confirmCrop.textContent = 'Confirm Crop';
            this.confirmCrop.disabled = false;
        }
    }

    async getCroppedBlob() {
        const cropBoxRect = this.cropBox.getBoundingClientRect();
        const canvasRect = this.imageCanvas.getBoundingClientRect();
        
        // Calculate crop area relative to canvas
        const cropArea = {
            x: Math.max(0, cropBoxRect.left - canvasRect.left),
            y: Math.max(0, cropBoxRect.top - canvasRect.top),
            width: Math.min(cropBoxRect.width, canvasRect.width),
            height: Math.min(cropBoxRect.height, canvasRect.height)
        };
        
        // Create temporary canvas for cropping
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set crop canvas size
        tempCanvas.width = cropArea.width;
        tempCanvas.height = cropArea.height;
        
        // Draw the cropped portion
        tempCtx.drawImage(
            this.imageCanvas,
            cropArea.x, cropArea.y, cropArea.width, cropArea.height,
            0, 0, cropArea.width, cropArea.height
        );
        
        // Convert to blob
        return new Promise((resolve) => {
            tempCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
        });
    }

    showPreview(blob) {
        this.previewSection.classList.remove('hidden');
        
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            // Set preview canvas size
            const maxSize = 300;
            let width = img.width;
            let height = img.height;
            
            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width *= ratio;
                height *= ratio;
            }
            
            this.previewCanvas.width = width;
            this.previewCanvas.height = height;
            
            // Draw preview
            this.previewCtx.clearRect(0, 0, width, height);
            this.previewCtx.drawImage(img, 0, 0, width, height);
            
            // Clean up
            URL.revokeObjectURL(url);
        };
        img.src = url;
        
        // Scroll to preview
        this.previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    onDownloadCrop() {
        if (!this.croppedBlob) return;
        
        const url = URL.createObjectURL(this.croppedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cropped-image.jpg';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert after file input
        this.fileInput.parentElement.insertAdjacentElement('afterend', errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the image cropper when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cropper = new ImageCropper();
    // Make it globally available for resize handling
    window.imageCropper = cropper;
});

// Handle window resize for responsive canvas
window.addEventListener('resize', () => {
    const cropper = window.imageCropper;
    if (cropper && cropper.originalImage) {
        setTimeout(() => cropper.drawImage(), 100);
    }
});