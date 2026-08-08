import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className={cn("space-y-6 pb-12", className)}
    >
      {children}
    </motion.div>
  );
}

export function PageSection({ children, className }: PageContainerProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <PageSection className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-2">
      <motion.div 
        className="relative group cursor-default p-2 -ml-2 rounded-lg hover:bg-white/[0.02] transition-colors border-l-2 border-transparent hover:border-primary pl-4"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h1 className="text-3xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-widest text-glow group-hover:text-primary transition-colors duration-300">
          <span className="text-primary mr-2 animate-pulse">{'>'}</span> {title} <span className="animate-pulse text-primary group-hover:text-white transition-colors duration-300">_</span>
        </h1>
        {description && (
          <p className="text-white/60 font-mono text-sm tracking-wider uppercase mt-2 group-hover:text-white/80 transition-colors duration-300">
            {description}
          </p>
        )}
      </motion.div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </PageSection>
  );
}
