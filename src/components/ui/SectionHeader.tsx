import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  highlightWord?: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  showAction?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  highlightWord,
  subtitle,
  actionText = 'View All',
  actionHref,
  onAction,
  showAction = true,
  className = '',
}: SectionHeaderProps) {
  // If highlightWord is provided, split the title and color the highlight word
  const renderTitle = () => {
    if (!highlightWord) return title;

    const parts = title.split(new RegExp(`(${highlightWord})`, 'gi'));
    return parts.map((part, idx) => {
      if (part.toLowerCase() === highlightWord.toLowerCase()) {
        return (
          <span key={idx} className="text-[#0284C7]">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const actionButton = (
    <button
      onClick={onAction}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full border border-[#0284C7] text-[#0284C7] bg-white hover:bg-[#E0F2FE]/50 transition-colors duration-150 cursor-pointer shadow-2xs"
    >
      <span>{actionText}</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 ${className}`}>
      <div className="flex items-start sm:items-center gap-3">
        {/* Left thin blue vertical line */}
        <div className="w-1.5 h-6 bg-[#0284C7] rounded-full flex-shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            {renderTitle()}
          </h2>
        </div>
      </div>

      {showAction && (
        <div className="self-end sm:self-auto">
          {actionHref ? (
            <Link href={actionHref} className="inline-block">
              {actionButton}
            </Link>
          ) : (
            actionButton
          )}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
