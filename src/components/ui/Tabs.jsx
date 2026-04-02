import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function Tabs({ children, defaultValue, value, onValueChange, className }) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={clsx('flex flex-col', className)}
    >
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children, className }) {
  return (
    <TabsPrimitive.List className={clsx(
      'flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]',
      className
    )}>
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ children, value, className }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={clsx(
        'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        'text-text-secondary hover:text-text-primary',
        'data-[state=active]:text-text-primary data-[state=active]:bg-violet/20',
        'data-[state=active]:shadow-sm data-[state=active]:shadow-violet/10',
        'focus-visible:outline-2 focus-visible:outline-violet',
        className
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ children, value, className }) {
  return (
    <TabsPrimitive.Content
      value={value}
      className={clsx('mt-4 focus-visible:outline-none', className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}
