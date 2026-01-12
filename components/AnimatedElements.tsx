'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ========================================
// 浮动旅行图标装饰组件
// ========================================
interface FloatingIconProps {
  icon: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const FloatingIcon: React.FC<FloatingIconProps> = ({
  icon,
  className = '',
  delay = 0,
  duration = 6
}) => {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.4, 0.8, 0.4],
        y: [0, -20, 0],
        rotate: [0, 5, 0, -5, 0]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {icon}
    </motion.div>
  );
};

// ========================================
// 旅行主题SVG图标
// ========================================
export const TravelIcons = {
  // 飞机图标
  Airplane: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  ),

  // 地球图标
  Globe: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),

  // 指南针图标
  Compass: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),

  // 地图图标
  Map: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16" />
    </svg>
  ),

  // 相机图标
  Camera: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),

  // 行李箱图标
  Luggage: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="6" width="16" height="16" rx="2" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M12 10v8M8 10v8M16 10v8" />
    </svg>
  ),

  // 热气球图标
  Balloon: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C8 2 4 5 4 10c0 3 2 5 4 7l2 2v2h4v-2l2-2c2-2 4-4 4-7 0-5-4-8-8-8z" />
      <path d="M9 21h6M12 13v4" />
    </svg>
  ),

  // 太阳图标
  Sun: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

// ========================================
// 功能特性图标（更精美的版本）
// ========================================
export const FeatureIcons = {
  // 可视化规划图标
  VisualPlanning: ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="40" height="32" rx="4" stroke="url(#grad1)" strokeWidth="2" />
      <circle cx="16" cy="20" r="4" fill="url(#grad1)" fillOpacity="0.3" stroke="url(#grad1)" strokeWidth="2" />
      <circle cx="32" cy="28" r="3" fill="url(#grad1)" fillOpacity="0.3" stroke="url(#grad1)" strokeWidth="2" />
      <path d="M16 20L24 24L32 28" stroke="url(#grad1)" strokeWidth="2" strokeDasharray="4 2" />
      <path d="M8 36L18 28L28 32L40 20" stroke="url(#grad1)" strokeWidth="2" />
    </svg>
  ),

  // POI管理图标
  POIManagement: ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f093fb" />
          <stop offset="100%" stopColor="#f5576c" />
        </linearGradient>
      </defs>
      <path d="M24 4C16 4 10 10 10 18c0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z" stroke="url(#grad2)" strokeWidth="2" fill="url(#grad2)" fillOpacity="0.2" />
      <circle cx="24" cy="18" r="6" stroke="url(#grad2)" strokeWidth="2" fill="white" />
      <circle cx="24" cy="18" r="2" fill="url(#grad2)" />
    </svg>
  ),

  // 行程规划图标
  ItineraryPlanning: ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="100%" stopColor="#3a7bd5" />
        </linearGradient>
      </defs>
      <rect x="8" y="6" width="32" height="36" rx="3" stroke="url(#grad3)" strokeWidth="2" />
      <path d="M8 14h32" stroke="url(#grad3)" strokeWidth="2" />
      <circle cx="16" cy="10" r="2" fill="url(#grad3)" />
      <circle cx="24" cy="10" r="2" fill="url(#grad3)" />
      <circle cx="32" cy="10" r="2" fill="url(#grad3)" />
      <path d="M14 22h8M14 28h12M14 34h6" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 24l4 4 8-8" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ========================================
// 鼠标跟随光效组件
// ========================================
export const MouseFollowGlow: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{
        left: position.x - 150,
        top: position.y - 150,
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{ duration: 0.3 }}
    />
  );
};

// ========================================
// 交错入场动画容器
// ========================================
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
};

// ========================================
// 打字机效果组件
// ========================================
interface TypewriterProps {
  texts: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  texts,
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000
}) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, textIndex, isDeleting, texts, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayText}
      <span className="cursor-blink">|</span>
    </span>
  );
};

// ========================================
// 3D倾斜卡片组件
// ========================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  tiltAmount = 10
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltAmount;
    const rotateY = ((x - centerX) / centerX) * tiltAmount;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`${className} perspective-1000`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
};

// ========================================
// 闪烁星星装饰组件
// ========================================
export const Stars: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    // 仅在客户端挂载后生成随机属性，避免水合错误
    const newStars = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1, // 稍微调小一点点，更精致
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, [count]);

  if (stars.length === 0) return null;

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white/40 animate-twinkle pointer-events-none"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </>
  );
};
