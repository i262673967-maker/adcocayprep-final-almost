// TODO: Read pricing directly from Lemon Squeezy API variants in production to ensure price synchronization

export interface PricingTier {
  id: string;
  name: string;
  priceDisplay: string;
  subtext: string;
  description: string;
  features: string[];
}

export const PRICING_DATA = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    priceDisplay: '$0',
    subtext: 'Forever free',
    description: '1 free meeting packet generation to try before your upcoming meeting.',
    features: [
      '1 Packet Generation',
      '1 Student Profile',
      'Full 1-Page Tactical Layout',
      '50-State PTI Center Directory Access'
    ]
  },
  singlePass: {
    id: 'single_pass',
    name: 'Single Meeting Pass',
    price: 15,
    priceDisplay: '$15',
    subtext: 'one-time purchase',
    description: 'One unwatermarked preparation packet for an upcoming IEP or 504 meeting. No subscription.',
    features: [
      '1 Unwatermarked Packet',
      'Full PDF & Digital Export',
      'Saved for 6 Months',
      'No Recurring Billing'
    ]
  },
  familyMonthly: {
    id: 'family_monthly',
    name: 'Family Plan (Monthly)',
    price: 12,
    priceDisplay: '$12',
    subtext: '/ month (billed monthly)',
    description: 'Unlimited preparation packets for all your children with active meeting tracking.',
    features: [
      'Unlimited Packet Generations',
      'Multiple Child Profiles',
      'Saved Meeting History',
      'Unwatermarked Clean PDF Exports',
      'State-Specific PTI Guidelines'
    ]
  },
  familyAnnual: {
    id: 'family_annual',
    name: 'Family Plan (Annual)',
    priceMonthlyEquivalent: 6.58,
    priceTotalAnnual: 79,
    priceDisplay: '$79',
    subtext: '/ year ($6.58/mo)',
    description: 'Save over 45% with annual billing. Unlimited preparation packets for all your children.',
    features: [
      'Unlimited Packet Generations',
      'Multiple Child Profiles',
      'Saved Meeting History',
      'Unwatermarked Clean PDF Exports',
      'State-Specific PTI Guidelines'
    ]
  }
};
