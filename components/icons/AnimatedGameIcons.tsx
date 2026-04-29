"use client";

import { motion } from "framer-motion";

interface AnimatedIconProps {
  size?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

export function AnimatedStar({ 
  size = 24, 
  color = "#fbbf24", 
  className,
  animate = true 
}: AnimatedIconProps) {
  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color} 
      className={className}
      initial={{ scale: 0, rotate: -180 }}
      animate={animate ? { 
        scale: [0, 1.3, 1],
        rotate: [-180, 15, -10, 0],
      } : { scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      <motion.path 
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.svg>
  );
}

export function AnimatedHeart({ 
  size = 24, 
  color = "#ef4444", 
  className,
  animate = true 
}: AnimatedIconProps) {
  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color} 
      className={className}
      animate={animate ? { 
        scale: [1, 1.2, 1],
      } : {}}
      transition={{ 
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.5,
      }}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </motion.svg>
  );
}

export function AnimatedTrophy({ 
  size = 24, 
  color = "#fbbf24", 
  className,
  animate = true 
}: AnimatedIconProps) {
  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color} 
      className={className}
      initial={{ y: 20, opacity: 0 }}
      animate={animate ? { 
        y: 0,
        opacity: 1,
      } : { y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
    >
      <motion.g
        animate={animate ? {
          rotate: [-5, 5, -5],
        } : {}}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "center bottom" }}
      >
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
      </motion.g>
    </motion.svg>
  );
}

export function AnimatedSparkles({ 
  size = 24, 
  color = "#fbbf24", 
  className 
}: AnimatedIconProps) {
  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      {/* Center sparkle */}
      <motion.path 
        d="M12 3L9 12l-9 3 9 3 3 9 3-9 9-3-9-3-3-9z"
        fill={color}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Small sparkles around */}
      <motion.circle
        cx="5"
        cy="5"
        r="1.5"
        fill={color}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.2,
        }}
      />
      <motion.circle
        cx="19"
        cy="5"
        r="1"
        fill={color}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.5,
        }}
      />
      <motion.circle
        cx="19"
        cy="19"
        r="1.5"
        fill={color}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.8,
        }}
      />
    </motion.svg>
  );
}

export function AnimatedFireworks({ 
  size = 100, 
  className 
}: Omit<AnimatedIconProps, 'color'>) {
  const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
  
  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
    >
      {colors.map((color, i) => {
        const angle = (i * 60) * (Math.PI / 180);
        const endX = 50 + Math.cos(angle) * 40;
        const endY = 50 + Math.sin(angle) * 40;
        
        return (
          <motion.circle
            key={i}
            r="4"
            fill={color}
            initial={{ cx: 50, cy: 50, opacity: 0 }}
            animate={{
              cx: [50, endX],
              cy: [50, endY],
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeOut",
            }}
          />
        );
      })}
    </motion.svg>
  );
}

export function AnimatedConfetti({ 
  size = 200, 
  className 
}: Omit<AnimatedIconProps, 'color'>) {
  const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
  const pieces = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    startX: 100,
    startY: 80,
    endX: 20 + Math.random() * 160,
    endY: 150 + Math.random() * 50,
    rotation: Math.random() * 720 - 360,
    delay: Math.random() * 0.3,
    width: 6 + Math.random() * 6,
    height: 4 + Math.random() * 4,
  }));

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
      {pieces.map((piece) => (
        <motion.rect
          key={piece.id}
          width={piece.width}
          height={piece.height}
          fill={piece.color}
          rx={1}
          initial={{ 
            x: piece.startX, 
            y: piece.startY, 
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: [piece.startX, piece.endX],
            y: [piece.startY, piece.endY],
            opacity: [0, 1, 1, 0],
            rotate: [0, piece.rotation],
          }}
          transition={{
            duration: 1.5,
            delay: piece.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}
