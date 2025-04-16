import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}

export function PhotoGallery({ photos, isOpen, onClose, position }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const visiblePhotos = photos.slice(currentIndex, currentIndex + 4);
  const canGoNext = currentIndex + 4 < photos.length;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) setCurrentIndex(prev => prev + 4);
  };

  const handlePrev = () => {
    if (canGoPrev) setCurrentIndex(prev => prev - 4);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed z-[1000] bg-black/80 backdrop-blur-sm p-4 rounded-lg shadow-lg"
          style={{
            top: `${position.top}px`,
            left: `${position.left + 100}px`,
          }}
          ref={galleryRef}
        >
          {/* Pontos conectores animados */}
          <motion.div 
            className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white rounded-full absolute"
                style={{
                  left: `${i * 10}px`,
                  top: '50%',
                }}
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>

          {/* Galeria de fotos */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-1 rounded-full ${canGoPrev ? 'text-white' : 'text-gray-500'}`}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {visiblePhotos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden"
                >
                  <img 
                    src={photo} 
                    alt={`Gallery ${index}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-1 rounded-full ${canGoNext ? 'text-white' : 'text-gray-500'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
