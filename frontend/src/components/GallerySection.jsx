import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { gym_first_name } from '../constants/constants';

// Adjust these import paths to wherever gym_image01–08 actually live
import gymImage01 from '../assets/gallery/gym_image01.webp';
import gymImage02 from '../assets/gallery/gym_image02.webp';
import gymImage03 from '../assets/gallery/gym_image03.webp';
import gymImage04 from '../assets/gallery/gym_image04.webp';
import gymImage05 from '../assets/gallery/gym_image05.webp';
import gymImage06 from '../assets/gallery/gym_image06.webp';
import gymImage07 from '../assets/gallery/gym_image07.webp';
import gymImage08 from '../assets/gallery/gym_image08.webp';

const galleryImages = [
  { src: gymImage01, alt: 'Weight training floor', span: 'row-span-2' },
  { src: gymImage02, alt: 'Cardio zone', span: '' },
  { src: gymImage03, alt: 'Functional training area', span: '' },
  { src: gymImage04, alt: 'Personal training session', span: 'row-span-2' },
  { src: gymImage05, alt: 'Free weights rack', span: '' },
  { src: gymImage06, alt: 'Locker and lounge area', span: '' },
  { src: gymImage07, alt: 'Group training session', span: 'row-span-2' },
  { src: gymImage08, alt: 'Gym entrance and reception', span: '' },
];

const GallerySection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const closeLightbox = () => setActiveIndex(null);
  const showPrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };
  const showNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="gallery" className="py-24 bg-dark-gray/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold font-bold tracking-widest text-sm uppercase inline-flex items-center gap-2 justify-center">
            <Camera className="h-4 w-4" />
            GALLERY
          </span>
          <h2 className="font-serif text-4xl font-extrabold mt-2 text-white">
            INSIDE <span className="text-gold-gradient">{gym_first_name?.toUpperCase()}</span>
          </h2>
          <p className="text-gray-400 text-sm mt-4 font-light">
            A closer look at our floors, equipment, and the energy that fuels every session.
          </p>
        </div>

        {/* Bento-style gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[180px] gap-4 md:gap-5">
          {galleryImages.map((img, idx) => (
            <motion.button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className={`group relative rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/40 hover-gold-shadow transition-all duration-300 ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-gold/20 backdrop-blur-sm border border-gold/40 p-3 rounded-full text-gold">
                  <Expand className="h-5 w-5" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-deep-black/95 backdrop-blur-md flex items-center justify-center px-4"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-gold transition-colors"
              aria-label="Close"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={showPrev}
              className="absolute left-4 md:left-10 text-white/70 hover:text-gold transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-9 w-9" />
            </button>

            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              src={galleryImages[activeIndex].src}
              alt={galleryImages[activeIndex].alt}
              className="max-h-[80vh] max-w-full rounded-xl border border-gold/20 shadow-2xl shadow-gold/10 object-contain"
            />

            <button
              onClick={showNext}
              className="absolute right-4 md:right-10 text-white/70 hover:text-gold transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;