import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Mail, ArrowRight } from 'lucide-react';

export interface CompactShareLinkProps {
  headerTitle: string; // e.g. "Fellowship Application page" or "Advisory Board / Academic Council page"
  shareUrl: string;
  badgeLabel?: string;
  subtitle?: string;
  theme?: 'amber' | 'indigo' | 'emerald';
  whatsappShareText?: string;
  emailSubject?: string;
  emailBody?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const CompactShareLink: React.FC<CompactShareLinkProps> = ({
  headerTitle,
  shareUrl,
  badgeLabel = 'Direct Shareable Link',
  subtitle,
  theme = 'amber',
  whatsappShareText,
  emailSubject,
  emailBody,
  secondaryAction,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: headerTitle,
          text: subtitle || `Direct link for ${headerTitle} (studeezone.com Sikkim STET):`,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // Fallback to copy if user cancels or share fails
      }
    }
    handleCopy();
  };

  const whatsappMessage = encodeURIComponent(
    whatsappShareText || `${headerTitle} - Direct Link (studeezone.com Sikkim STET):\n${shareUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const mailSub = encodeURIComponent(emailSubject || `${headerTitle} - studeezone.com`);
  const mailContent = encodeURIComponent(
    emailBody ||
      `Dear Colleague,\n\nPlease find the direct link for ${headerTitle}:\n${shareUrl}\n\nWarm regards,\nstudeezone Academic Governance Council`
  );
  const emailUrl = `mailto:?subject=${mailSub}&body=${mailContent}`;

  const themeStyles = {
    amber: {
      wrapper: 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border-amber-300/80',
      iconBg: 'bg-amber-500 text-slate-950',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      copyBtn: 'bg-indigo-600 hover:bg-indigo-700',
    },
    indigo: {
      wrapper: 'bg-gradient-to-r from-indigo-500/10 via-slate-500/5 to-amber-500/10 border-indigo-300/80',
      iconBg: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      copyBtn: 'bg-indigo-600 hover:bg-indigo-700',
    },
    emerald: {
      wrapper: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border-emerald-300/80',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      copyBtn: 'bg-emerald-600 hover:bg-emerald-700',
    },
  }[theme];

  return (
    <div
      className={`border rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xs transition-all ${themeStyles.wrapper}`}
      data-testid="compact-shareable-link"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold shadow-xs ${themeStyles.iconBg}`}
          >
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex items-center flex-wrap gap-1.5">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 font-['Outfit'] tracking-tight truncate">
              {headerTitle}
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${themeStyles.badge}`}
            >
              {badgeLabel}
            </span>
          </div>
        </div>

        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center space-x-1 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>{secondaryAction.label}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-600 mb-2 leading-snug">
          {subtitle}
        </p>
      )}

      {/* Compact single-row link bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
        <div
          onClick={handleCopy}
          title="Click to copy link"
          className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-700 truncate shadow-inner flex items-center justify-between cursor-pointer hover:border-indigo-400 select-all"
        >
          <span className="truncate">{shareUrl}</span>
          <span className="text-[10px] text-slate-400 shrink-0 ml-2 hidden md:inline font-sans">
            (click to copy)
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95 ${
              copied ? 'bg-emerald-600' : themeStyles.copyBtn
            }`}
            title="Copy direct shareable link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-100" />
                <span className="text-white font-black">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer shrink-0"
            title="Share via WhatsApp"
          >
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleNativeShare}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer shrink-0"
            title="Share via Device"
          >
            <Share2 className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <a
            href={emailUrl}
            className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer shrink-0"
            title="Share via Email"
          >
            <Mail className="w-3 h-3 text-slate-200" />
          </a>
        </div>
      </div>
    </div>
  );
};
