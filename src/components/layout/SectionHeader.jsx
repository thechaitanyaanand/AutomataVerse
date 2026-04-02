import { motion } from 'framer-motion';

export default function SectionHeader({ title, subtitle, badge, align = 'center' }) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col mb-12 ${alignClass}`}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium
          bg-flora/10 text-flora-light border border-flora/20 mb-5 w-fit">
          {badge}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-text-secondary text-lg leading-relaxed ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
