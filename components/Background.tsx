export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50 opacity-90"></div>
      
      {/* Color orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E0E7FF] rounded-full blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#FEF3C7] rounded-full blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
    </div>
  );
}
