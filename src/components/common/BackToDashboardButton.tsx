import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface BackToDashboardButtonProps {
  onClick?: () => void;
  variant?: 'light' | 'dark';
  className?: string;
}

export const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({
  onClick,
  variant = 'light',
  className = ''
}) => {
  const { setActiveTab } = useAdmin();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setActiveTab('dashboard');
    }
  };

  const baseStyle =
    variant === 'dark'
      ? 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition shrink-0 cursor-pointer shadow-2xs'
      : 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition shrink-0 cursor-pointer shadow-2xs';

  return (
    <button
      type="button"
      id="btn-back-to-dashboard"
      onClick={handleClick}
      className={`${baseStyle} ${className}`.trim()}
      title="Return to Dashboard"
      aria-label="Back to Dashboard"
    >
      <ArrowLeft className={`w-3.5 h-3.5 ${variant === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
      <span className="hidden sm:inline">Back to Dashboard</span>
      <span className="sm:hidden">Back</span>
    </button>
  );
};
