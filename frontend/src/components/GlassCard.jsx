import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect ? { y: -8, transition: { duration: 0.2 } } : {}}
      className={`glass-premium rounded-2xl p-6 transition-all duration-300 ${hoverEffect ? 'hover-gold-shadow' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
