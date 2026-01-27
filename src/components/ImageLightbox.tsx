import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  caption?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  src,
  alt = 'Image',
  caption
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
        handleRotate();
        break;
      case '0':
        handleReset();
        break;
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      handleReset();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Controls */}
          <div 
            className="absolute top-4 right-4 z-10 flex items-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/10"
              title="Zoom out (-)"
            >
              <ZoomOut size={20} />
            </Button>
            <span className="text-white text-sm font-mono min-w-[4ch] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/10"
              title="Zoom in (+)"
            >
              <ZoomIn size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="text-white hover:bg-white/10"
              title="Rotate (R)"
            >
              <RotateCw size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/10"
              title="Download"
            >
              <Download size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
              title="Close (Esc)"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Image Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <motion.img
              src={src}
              alt={alt}
              className="max-w-full max-h-[80vh] object-contain cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              onDoubleClick={handleReset}
              draggable={false}
            />
            
            {caption && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-white/80 text-center text-sm italic max-w-2xl"
              >
                {caption}
              </motion.p>
            )}
          </motion.div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            Double-click to reset • Scroll to zoom • Press Esc to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for managing lightbox state
export const useLightbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageData, setImageData] = useState<{ src: string; alt?: string; caption?: string }>({ src: '' });

  const openLightbox = (src: string, alt?: string, caption?: string) => {
    setImageData({ src, alt, caption });
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    imageData,
    openLightbox,
    closeLightbox
  };
};
