import { motion } from 'framer-motion';

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`min-h-screen pt-20 bg-grid ${className}`}
    >
      {children}
    </motion.div>
  );
}
