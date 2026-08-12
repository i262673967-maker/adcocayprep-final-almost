import React from 'react';
import { AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { MANDATORY_LEGAL_DISCLAIMER } from '../data/stateData';

interface FooterDisclaimerProps {
  stateCode?: string;
  onOpenStateRights?: () => void;
  compact?: boolean;
}

export const FooterDisclaimer: React.FC<FooterDisclaimerProps> = ({
  stateCode,
  onOpenStateRights,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border-y border-amber-300 py-3 px-4 text-sm text-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-start gap-2 font-medium text-slate-900">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />

          <span>
            <strong>Informational & Organizational Use Only:</strong>{' '}
            {MANDATORY_LEGAL_DISCLAIMER}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
          <a
            href="/terms"
            className="text-slate-600 hover:text-slate-900 hover:underline"
          >
            Terms
          </a>

          <a
            href="/privacy"
            className="text-slate-600 hover:text-slate-900 hover:underline"
          >
            Privacy
          </a>

          <a
            href="/refunds"
            className="text-slate-600 hover:text-slate-900 hover:underline"
          >
            Refunds
          </a>

          {onOpenStateRights && (
            <button
              onClick={onOpenStateRights}
              className="text-indigo-800 hover:text-indigo-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              State PTI Directory {stateCode ? `(${stateCode})` : ''}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <footer className="bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 mt-12 border-t-2 border-amber-500 text-sm leading-relaxed">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Important Legal Notice</span>
          </div>

          <div className="p-4 bg-slate-800/90 rounded-lg border border-amber-500/40 text-slate-100 font-medium leading-normal text-sm shadow-inner">
            {MANDATORY_LEGAL_DISCLAIMER}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>AdvocacyPrep</span>
          </div>

          <div className="text-xs text-slate-400">
            Parent Advocacy & IEP Preparation Tool
          </div>

          <div className="pt-2 flex flex-col gap-1.5 text-xs">
            <a
              href="/pricing"
              className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium"
            >
              Pricing
            </a>

            <a
              href="/terms"
              className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium"
            >
              Terms of Service
            </a>

            <a
              href="/privacy"
              className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium"
            >
              Privacy Policy
            </a>

            <a
              href="/refunds"
              className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium"
            >
              Refund Policy
            </a>

            {onOpenStateRights && (
              <button
                onClick={onOpenStateRights}
                className="mt-1 inline-flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 hover:underline font-semibold cursor-pointer text-left"
              >
                <span>50-State PTI Center Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
            <button onClick={onOpenTerms} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
              Terms
            </button>
          )}
          {onOpenPrivacy && (
            <button onClick={onOpenPrivacy} className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
              Privacy
            </button>
          )}
          {onOpenStateRights && (
            <button
              onClick={onOpenStateRights}
              className="text-indigo-800 hover:text-indigo-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              State PTI Directory {stateCode ? `(${stateCode})` : ''}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <footer className="bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 mt-12 border-t-2 border-amber-500 text-sm leading-relaxed">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Important Legal Notice</span>
          </div>
          <div className="p-4 bg-slate-800/90 rounded-lg border border-amber-500/40 text-slate-100 font-medium leading-normal text-sm shadow-inner">
            {MANDATORY_LEGAL_DISCLAIMER}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>AdvocacyPrep</span>
          </div>
          <div className="text-xs text-slate-400">Parent Advocacy & IEP Preparation Tool</div>

          <div className="pt-2 flex flex-col gap-1.5 text-xs text-indigo-300">
            {onOpenTerms && (
              <button
                onClick={onOpenTerms}
                className="text-left hover:text-indigo-200 hover:underline cursor-pointer font-medium"
              >
                Terms of Service
              </button>
            )}
            {onOpenPrivacy && (
              <button
                onClick={onOpenPrivacy}
                className="text-left hover:text-indigo-200 hover:underline cursor-pointer font-medium"
              >
                Privacy Policy
              </button>
            )}
            {onOpenStateRights && (
              <button
                onClick={onOpenStateRights}
                className="mt-1 inline-flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 hover:underline font-semibold cursor-pointer"
              >
                <span>50-State PTI Center Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

