import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  CreditCard,
  Lock,
  AlertCircle
} from 'lucide-react';
import { UserProfile, PlanTier } from '../types';
import { getAuthToken } from '../lib/firebase';
import { PRICING_DATA } from '../data/pricing';

interface PricingModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (tier: PlanTier) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (planType: 'family_subscription' | 'single_pass') => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const token = await getAuthToken();

      let res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType,
          billingCycle
        })
      });

      if (res.status === 404) {
        res = await fetch('/api/checkout/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            planType,
            billingCycle
          })
        });
      }

      const data = await res.json();
      if (data.checkoutUrl) {
        if (data.isSimulated) {
          setErrorMsg('Development notice: Lemon Squeezy store/variant keys are not yet configured in environment variables. Set LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_VARIANT_* in .env to connect live checkout.');
          setTimeout(() => {
            window.open(data.checkoutUrl, '_blank');
          }, 1500);
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else {
        setErrorMsg(data.error || 'Failed to generate Lemon Squeezy checkout URL.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error connecting to payment provider.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-bold">
              Transparent Family Pricing
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Choose the Plan That Fits Your Family
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Never walk into an IEP or 504 meeting unprepared. Upgrade for unlimited packet generations and multi-child support.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Annual vs Monthly Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-700 border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Monthly Billing ({PRICING_DATA.familyMonthly.priceDisplay}/mo)
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
            >
              <span>Annual Billing ({PRICING_DATA.familyAnnual.priceDisplay}/yr)</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                Save 45%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="font-bold text-slate-900 text-base">{PRICING_DATA.free.name}</div>
              <div className="text-3xl font-black text-slate-900">{PRICING_DATA.free.priceDisplay}</div>
              <p className="text-xs text-slate-600">{PRICING_DATA.free.description}</p>
              <ul className="text-xs space-y-2 text-slate-700">
                {PRICING_DATA.free.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">&bull; {feat}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              {user.planTier === 'free_user' ? 'Current Plan' : 'Free Tier'}
            </button>
          </div>

          {/* Family Plan */}
          <div className="border-2 border-indigo-600 rounded-2xl p-6 bg-white shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-0.5 rounded-full tracking-wider">
              Recommended for Parents
            </div>
            <div className="space-y-4 pt-1">
              <div className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                Family Plan
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {billingCycle === 'annual' ? `$${PRICING_DATA.familyAnnual.priceMonthlyEquivalent}` : PRICING_DATA.familyMonthly.priceDisplay}
                </span>
                <span className="text-xs text-slate-500">
                  / month ({billingCycle === 'annual' ? `billed ${PRICING_DATA.familyAnnual.priceDisplay}/yr` : 'billed monthly'})
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {billingCycle === 'annual' ? PRICING_DATA.familyAnnual.description : PRICING_DATA.familyMonthly.description}
              </p>
              <ul className="text-xs space-y-2 text-slate-700">
                {(billingCycle === 'annual' ? PRICING_DATA.familyAnnual.features : PRICING_DATA.familyMonthly.features).map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 font-medium text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              disabled={isProcessing}
              onClick={() => handleSubscribe('family_subscription')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-xs shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? 'Connecting to Lemon Squeezy...' : 'Subscribe to Family Plan'}</span>
            </button>
          </div>

          {/* Single Meeting Pass */}
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="font-bold text-slate-900 text-base">{PRICING_DATA.singlePass.name}</div>
              <div className="text-3xl font-black text-slate-900">
                {PRICING_DATA.singlePass.priceDisplay} <span className="text-xs font-normal text-slate-500">{PRICING_DATA.singlePass.subtext}</span>
              </div>
              <p className="text-xs text-slate-600">{PRICING_DATA.singlePass.description}</p>
              <ul className="text-xs space-y-2 text-slate-700">
                {PRICING_DATA.singlePass.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">&bull; {feat}</li>
                ))}
              </ul>
            </div>
            <button
              disabled={isProcessing}
              onClick={() => handleSubscribe('single_pass')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-50"
            >
              Buy {PRICING_DATA.singlePass.priceDisplay} Pass
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 border-t pt-4 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Secured via Lemon Squeezy Checkout &bull; Cancel anytime in settings &bull; No hidden fees</span>
        </div>
      </div>
    </div>
  );
};

