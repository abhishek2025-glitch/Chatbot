export type Role = 'user' | 'assistant' | 'system';

export type EscalationType = 
  | 'booking'
  | 'exact_price'
  | 'pain_emergency'
  | 'human_request'
  | 'out_of_scope';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  isEscalation?: boolean;
  escalationType?: EscalationType;
  escalationAction?: {
    label: string;
    whatsappUrl?: string;
    calendlyUrl?: string;
    phone?: string;
  };
}

export interface LeadRecord {
  name: string;
  homeCountry: string;
  procedureInterest: string;
  budgetBand: string;
  travelTimeframe: string;
  preferredContact: string;
  conversationSummary: string;
  escalationFlag: boolean;
  qualificationStatus: 'In Discussion' | 'Partially Qualified' | 'Fully Qualified' | 'Escalated to Human' | 'Out of Scope';
  lastUpdated: string;
}

export type AppVariant = 'dazzle_dental' | 'jws_interiors';

export interface ClinicKnowledge {
  name: string;
  tagline: string;
  location: string;
  leadProfile: string;
  services: string[];
  priceRanges: { procedure: string; range: string; note: string }[];
  timelines: string[];
  internationalPerks: string[];
  differentiators: string[];
  whatsappContact: string;
  calendlyUrl: string;
  supportedLanguages: string[];
}

export interface GroqSettings {
  apiKey: string;
  model: string;
  workerUrl: string;
  isDemoMode: boolean;
  useFallbackEngine: boolean;
}
