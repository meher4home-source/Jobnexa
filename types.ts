
export enum Region {
  GLOBAL = 'Global (International Standard)',
  US = 'United States (Harvard / ATS Optimized)',
  CANADA = 'Canada (North American Standard)',
  UK = 'United Kingdom (Professional CV)',
  IRELAND = 'Ireland (Tech Hub Standard)',
  GERMANY = 'Germany (Lebenslauf / EU Standard)',
  FRANCE = 'France (Standard)',
  SWITZERLAND = 'Switzerland (Banking/Tech Standard)',
  NETHERLANDS = 'Netherlands (Dutch Style)',
  NORDIC = 'Nordics (Sweden, Norway, Denmark)',
  AUSTRALIA = 'Australia & New Zealand',
  INDIA = 'India (Naukri / Corporate)',
  SINGAPORE = 'Singapore (Modern)',
  UAE = 'UAE / Middle East (Dubai Standard)',
  SAUDI = 'Saudi Arabia (Modern)',
  JAPAN = 'Japan (Global Tech)',
  REMOTE = 'Remote / Distributed Teams'
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  experience: string; // Free text or formatted
  skills: string;
  education: string;
  targetRole: string;
  targetRegion: Region;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppSection {
  PROFILE = 'profile',
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  INTERVIEW = 'interview',
  MARKET_ANALYSIS = 'market_analysis',
  CHAT = 'chat',
  PREMIUM = 'premium'
}
