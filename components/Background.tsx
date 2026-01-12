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
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#f5f3ff]">

      {/* 1. 核心 Mesh Gradient 渐变层 - 加深饱和度 */}
      <div className="absolute inset-0 opacity-85">
        {/* 左上 Indigo/Violet */}
        <div className="absolute top-[-25%] left-[-15%] w-[85%] h-[85%] bg-[#c7d2fe] rounded-full blur-[130px] opacity-90" />
        {/* 右上 Pink/Fuchsia */}
        <div className="absolute top-[-15%] right-[-10%] w-[65%] h-[75%] bg-[#fbcfe8] rounded-full blur-[110px] opacity-80" />
        {/* 中心亮调色彩辅助 */}
        <div className="absolute top-[30%] left-[20%] w-[60%] h-[55%] bg-[#ede9fe] rounded-full blur-[120px]" />
        {/* 左下 Cyan/Blue */}
        <div className="absolute bottom-[-15%] left-[-10%] w-[75%] h-[75%] bg-[#bae6fd] rounded-full blur-[130px] opacity-90" />
        {/* 右下 Rose/Orange */}
        <div className="absolute bottom-[-20%] right-[-15%] w-[85%] h-[85%] bg-[#fecdd3] rounded-full blur-[140px] opacity-80" />

        {/* 额外增加一层深色调填充，增加厚重感 */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#ddd6fe] rounded-full blur-[100px] opacity-50" />
      </div>

      {/* 2. 中心多层同心圆涟漪 (核心改进：大幅增强可见度) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px]">
        {/* 中心核心柔光 */}
        <div className="absolute inset-0 rounded-full bg-white/40 scale-[0.35] blur-[100px]" />

        {/* 核心主光环 (图片中最粗的那一圈) */}
        <div
          className="absolute inset-0 rounded-full border-[12px] border-white/40 animate-breathe pointer-events-none blur-[4px]"
          style={{
            '--base-scale': '0.55',
            boxShadow: '0 0 60px rgba(255, 255, 255, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2)',
            willChange: 'transform'
          } as any}
        />

        {/* 动态圆环层 - 增加厚度和发光 */}
        <RippleCircle scale="0.42" opacity={0.8} delay="0s" borderWeight="3px" />
        <RippleCircle scale="0.48" opacity={0.6} delay="0.4s" borderWeight="2px" />
        <RippleCircle scale="0.62" opacity={0.45} delay="0.8s" borderWeight="1.5px" />
        <RippleCircle scale="0.75" opacity={0.3} delay="1.2s" borderWeight="1px" />
        <RippleCircle scale="0.88" opacity={0.2} delay="1.6s" borderWeight="1px" />
        <RippleCircle scale="1.05" opacity={0.1} delay="2s" borderWeight="1px" />

        {/* 最外层超大漫反射环 */}
        <div className="absolute inset-0 rounded-full border-[100px] border-white/10 scale-[1.2] blur-[80px]" />
      </div>

      {/* 3. 星星点缀 - 使用更细碎的效果 */}
      <Stars count={18} />

      {/* 4. 装饰图标层 - 按照图片布局分布，调低存在感 */}
      <FloatingIcon
        icon={<TravelIcons.Balloon className="w-16 h-16 text-indigo-400/15" />}
        className="top-[10%] left-[8%]"
        delay={0}
        duration={12}
      />
      <FloatingIcon
        icon={<TravelIcons.Airplane className="w-10 h-10 text-purple-400/15" />}
        className="top-[15%] right-[10%]"
        delay={2}
        duration={15}
      />
      <FloatingIcon
        icon={<TravelIcons.Camera className="w-10 h-10 text-pink-400/12" />}
        className="bottom-[25%] left-[12%]"
        delay={4}
        duration={14}
      />
      <FloatingIcon
        icon={<TravelIcons.Compass className="w-12 h-12 text-blue-400/15" />}
        className="bottom-[18%] right-[25%]"
        delay={1}
        duration={18}
      />
      <FloatingIcon
        icon={<TravelIcons.Globe className="w-14 h-14 text-indigo-500/10" />}
        className="top-[45%] right-[5%]"
        delay={3}
        duration={20}
      />
      <FloatingIcon
        icon={<TravelIcons.Map className="w-10 h-10 text-fuchsia-400/12" />}
        className="top-[60%] left-[5%]"
        delay={5}
        duration={16}
      />

      {/* 5. 极细微的点阵纹理 - 增加设计的高级感 */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.3) 0.5px, transparent 0.5px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)'
        }}
      />
    </div>
  );
}

