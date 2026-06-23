import { motion } from 'framer-motion';
import { whatsapp_number } from '../constants/constants';

export const WhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/${whatsapp_number}?text=Hello%2C%20I%27m%20interested%20in%20joining%20your%20gym.%20Could%20you%20please%20provide%20details%20about%20membership%20plans%2C%20fees%2C%20and%20any%20current%20offers%3F%20Thank%20you.`; // Dynamic chat link

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.6)] transition-shadow duration-300 cursor-pointer"
      aria-label="Contact us on WhatsApp"
    >
      <svg
        className="w-8 h-8 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.384 9.86-9.778.002-2.613-1.015-5.07-2.866-6.92C16.615 2.056 14.16 1.037 11.55 1.036c-5.438 0-9.863 4.385-9.866 9.78-.001 1.702.443 3.363 1.284 4.811L1.996 21.82l6.395-1.666zM17.487 14.39c-.3-.15-1.782-.88-2.054-.98-.272-.1-.469-.15-.665.15-.196.3-.758.98-.93 1.18-.172.2-.343.225-.643.075-.3-.15-1.268-.467-2.414-1.49-1.013-.9-1.696-2.012-1.895-2.35-.198-.34-.022-.524.149-.696.154-.155.343-.4.515-.6.172-.2.23-.34.343-.566.113-.227.056-.426-.028-.575-.085-.15-.665-1.615-.913-2.2-.24-.58-.485-.5-.665-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.3-.1.98.1 1.18.2 1.98.8 3.9 1.6 4.7.8.8 2.2 3.5 4.9 4.7.64.28 1.14.45 1.53.57.65.2 1.24.18 1.71.11.52-.08 1.78-.73 2.03-1.43.25-.7.25-1.29.17-1.42-.08-.13-.27-.2-.57-.35z" />
      </svg>
    </motion.a>
  );
};

export default WhatsAppButton;
