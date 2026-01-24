"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ExpandableTagProps {
  label: string;
  description: string;
  icon?: React.ReactNode;
}

function ExpandableTag({ label, description, icon }: ExpandableTagProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      layout
      className="inline-flex items-center gap-2 rounded-full 
                 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 
                 dark:from-cyan-500/20 dark:to-teal-500/20
                 backdrop-blur-md border border-cyan-500/30 
                 px-5 py-2.5 cursor-pointer
                 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/10
                 transition-colors duration-300"
      style={{ borderRadius: 9999 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {icon && <span className="text-cyan-500">{icon}</span>}
      
      <AnimatePresence mode="wait">
        <motion.span
          key={isHovering ? "expanded" : "collapsed"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium"
        >
          {isHovering ? (
            <span className="text-gray-700 dark:text-gray-200">
              <strong className="text-cyan-600 dark:text-cyan-400">{label}</strong>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-600 dark:text-gray-300">{description}</span>
            </span>
          ) : (
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{label}</span>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

export function ExpandableTags() {
  const tags = [
    { 
      label: "Automate", 
      description: "business, finance, sales & marketing processes"
    },
    { 
      label: "Engage", 
      description: "customers, employees & partners"
    },
    { 
      label: "Scale", 
      description: "campaigns, sales & business"
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center">
      {tags.map((tag, index) => (
        <motion.div
          key={tag.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <ExpandableTag {...tag} />
        </motion.div>
      ))}
    </div>
  );
}

export default ExpandableTags;