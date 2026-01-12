'use client';

import { FloatingIcon, TravelIcons, Stars } from './AnimatedElements';

/**
 * 涟漪圆环子组件 - 增强了白色发光效果
 */
const RippleCircle = ({ delay, scale, opacity, borderWeight = '2px' }: { delay: string, scale: string, opacity: number, borderWeight?: string }) => (
  <div
    className="absolute inset-0 rounded-full border-white animate-breathe pointer-events-none"
    style={{
      borderWidth: borderWeight,
      '--base-scale': scale,
      opacity: opacity,
      animationDelay: delay,
      // 增强外发光，模拟灯管/光晕效果
      boxShadow: `0 0 20px rgba(255, 255, 255, ${opacity * 0.5}), inset 0 0 20px rgba(255, 255, 255, ${opacity * 0.2})`,
      willChange: 'transform, opacity'
    } as any}
  />
);

export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      {/* 1. 核心 Mesh Gradient 渐变层 - 柔和自然效果 */}
      <div className="absolute inset-0 opacity-85">
        {/* 左上 Indigo/Violet */}
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-[#c7d2fe] rounded-full blur-[120px] opacity-60" />
        {/* 右上 Pink/Fuchsia */}
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#fbcfe8] rounded-full blur-[110px] opacity-50" />
        {/* 中心亮调色彩辅助 */}
        <div className="absolute top-[30%] left-[20%] w-[50%] h-[45%] bg-[#ede9fe] rounded-full blur-[120px] opacity-70" />
        {/* 左下 Cyan/Blue */}
        <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#bfdbfe] rounded-full blur-[120px] opacity-60" />
        {/* 右下 Rose/Orange */}
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-[#fecdd3] rounded-full blur-[130px] opacity-50" />
      </div>

      {/* 2. 中心多层同心圆涟漪 (简化版：提升性能) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px]">
        {/* 中心核心柔光 */}
        <div className="absolute inset-0 rounded-full bg-white/30 scale-[0.35] blur-[80px]" />

        {/* 核心主光环 */}
        <div
          className="absolute inset-0 rounded-full border-[10px] border-white/50 animate-breathe pointer-events-none blur-[2px]"
          style={{
            '--base-scale': '0.55',
            boxShadow: '0 0 40px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)',
            willChange: 'transform'
          } as any}
        />

        {/* 简化的动态圆环层 - 减少数量提升性能 */}
        <RippleCircle scale="0.45" opacity={0.6} delay="0s" borderWeight="2px" />
        <RippleCircle scale="0.60" opacity={0.4} delay="0.8s" borderWeight="1.5px" />
        <RippleCircle scale="0.75" opacity={0.25} delay="1.6s" borderWeight="1px" />
      </div>

      {/* 3. 星星点缀 - 减少数量提升性能 */}
      <Stars count={10} />

      {/* 4. 极细微的点阵纹理 - 更淡更自然 */}
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.2) 0.5px, transparent 0.5px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)'
        }}
      />
    </div>
  );
}

