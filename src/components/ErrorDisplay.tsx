"use client";

import React from 'react';
import { ErrorDisplay as ErrorDisplayType } from '@/lib/error-utils';

interface ErrorDisplayProps {
  error: ErrorDisplayType;
  onRetry?: () => void;    // shown only if error.retryable === true
  onDismiss?: () => void;  // always shown if provided
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onDismiss }) => {
  return (
    <div className="w-full border border-error/30 bg-surface-container-lowest flex flex-col animate-fade-in shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {/* Card Header - Matching app style */}
      <div className="bg-error/10 border-b border-error/20 p-2 flex justify-between items-center px-4">
        <span className="font-label-caps text-[10px] text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">report</span>
          SYSTEM_ALERT // {error.title}
        </span>
        <span className="font-label-caps text-[9px] text-error/50">CODE: {error.code}</span>
      </div>

      {/* Card Content */}
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-error text-3xl hidden sm:block shrink-0">error</span>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-error uppercase tracking-tight font-headline-lg">
              {error.title.replace(/_/g, ' ')}
            </h3>
            <p className="font-code-sm text-sm text-on-surface-variant leading-relaxed opacity-90">
              {error.message}
            </p>
          </div>
        </div>

        {/* Actions - Matching app button style */}
        <div className="flex flex-wrap gap-3 mt-2">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="border border-error/40 bg-error/5 px-6 py-2 font-label-caps text-xs text-error hover:bg-error hover:text-surface transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              RETRY_PROTOCOL
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="border border-outline-variant px-6 py-2 font-label-caps text-xs text-on-surface-variant hover:bg-surface-variant transition-all cursor-pointer"
            >
              DISMISS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
