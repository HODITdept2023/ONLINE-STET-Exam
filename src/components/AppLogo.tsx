import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`inline-flex items-center ${showText ? 'space-x-3' : ''} ${className}`}>
      {/* 3D Graduation Cap + Open Book Icon */}
      <div className={`relative shrink-0 ${sizeMap[size]} flex items-center justify-center`}>
        <img
          src="/studeezone-icon.svg"
          alt="studeezone.com app icon"
          className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-['Outfit'] leading-none">
            studee<span className="text-blue-600">zone</span><span className="text-slate-500 font-bold text-sm">.com</span>
          </span>
          <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold mt-0.5">
            STET Preparation Platform
          </span>
        </div>
      )}
    </div>
  );
};
