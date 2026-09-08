import React from 'react';
import aiAssistantIcon from '@/ai-assistant-icon.jpg.jpeg';

interface ChatbotLogoProps {
  className?: string;
  size?: number | string;
  onClick?: () => void;
}

export const ChatbotLogo: React.FC<ChatbotLogoProps> = ({
  className = '',
  size = 56,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer group ${className}`}
      style={{ width: size, height: size }}
      role="button"
      aria-label="AlgoLearn AI Assistant"
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <img
          src={aiAssistantIcon}
          alt="AI Assistant"
          className="w-full h-full object-cover scale-[1.23] select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};


