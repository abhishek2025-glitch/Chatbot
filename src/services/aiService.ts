import { ChatMessage, LeadRecord, AppVariant, EscalationType } from '../types';
import { 
  DAZZLE_DENTAL_SYSTEM_PROMPT, 
  JWS_INTERIORS_SYSTEM_PROMPT,
  DAZZLE_DENTAL_KNOWLEDGE 
} from '../data/prompts';

export interface InferenceResult {
  reply: string;
  isEscalation: boolean;
  escalationType?: EscalationType;
  extractedLeadUpdates?: Partial<LeadRecord>;
  provider: 'groq' | 'fallback';
  modelUsed: string;
}

export async function generateChatReply(
  messages: ChatMessage[],
  variant: AppVariant,
  groqKey: string,
  groqModel: string = 'openai/gpt-oss-120b'
): Promise<InferenceResult> {
  const systemPrompt = variant === 'dazzle_dental' 
    ? DAZZLE_DENTAL_SYSTEM_PROMPT 
    : JWS_INTERIORS_SYSTEM_PROMPT;

  // Format messages for OpenAI-compatible API
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  // 1. If Groq API Key is provided, call Groq API live
  if (groqKey && groqKey.trim().length > 5) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey.trim()}`
        },
        body: JSON.stringify({
          model: groqModel || 'openai/gpt-oss-120b',
          messages: formattedMessages,
          temperature: 0.4,
          max_completion_tokens: 600
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Groq API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "I apologize, I didn't receive a response. Please try again.";

      const escalation = detectEscalation(reply, messages[messages.length - 1]?.content || '');
      const leadUpdates = extractLeadFields(messages);

      return {
        reply,
        isEscalation: escalation.isEscalated,
        escalationType: escalation.type,
        extractedLeadUpdates: leadUpdates,
        provider: 'groq',
        modelUsed: groqModel
      };
    } catch (error: any) {
      console.warn('Groq live API call error:', error);
      // Fallback with an explanation if Groq returned an error (e.g. rate limit, invalid key, or model alias)
      return {
        reply: `⚠️ Groq Notice: ${error?.message || 'Could not complete Groq request'}. Falling back to Dazzle Dental's local concierge logic so your demo continues seamlessly without interruption.\n\n${generateSimulatedReply(messages, variant)}`,
        isEscalation: false,
        extractedLeadUpdates: extractLeadFields(messages),
        provider: 'fallback',
        modelUsed: 'local-guardrail-engine'
      };
    }
  }

  // 2. Local Guardrail Engine (Safe fallback matching exact system prompt logic)
  const simulatedReply = generateSimulatedReply(messages, variant);
  const escalation = detectEscalation(simulatedReply, messages[messages.length - 1]?.content || '');
  const leadUpdates = extractLeadFields(messages);

  return {
    reply: simulatedReply,
    isEscalation: escalation.isEscalated,
    escalationType: escalation.type,
    extractedLeadUpdates: leadUpdates,
    provider: 'fallback',
    modelUsed: 'local-guardrail-engine (Add Groq Key for live 120B model)'
  };
}

// Escalation detection based on TRD §7 triggers
function detectEscalation(reply: string, lastUserMessage: string): { isEscalated: boolean; type?: EscalationType } {
  const userLower = lastUserMessage.toLowerCase();
  const replyLower = reply.toLowerCase();

  // Booking escalation
  if (
    userLower.includes('book') || 
    userLower.includes('appointment') || 
    userLower.includes('confirm my') ||
    userLower.includes('reserve') ||
    userLower.includes('schedule')
  ) {
    return { isEscalated: true, type: 'booking' };
  }

  // Pain / Medical Emergency
  if (
    userLower.includes('pain') || 
    userLower.includes('throbbing') || 
    userLower.includes('swelling') || 
    userLower.includes('toothache') ||
    userLower.includes('broken tooth') ||
    userLower.includes('bleeding') ||
    userLower.includes('infection')
  ) {
    return { isEscalated: true, type: 'pain_emergency' };
  }

  // Exact price demand
  if (
    userLower.includes('exact price') || 
    userLower.includes('exact cost') || 
    userLower.includes('precise number') ||
    userLower.includes('binding quote')
  ) {
    return { isEscalated: true, type: 'exact_price' };
  }

  // Explicit human request
  if (
    userLower.includes('speak to human') || 
    userLower.includes('talk to a person') || 
    userLower.includes('real dentist') || 
    userLower.includes('coordinator directly')
  ) {
    return { isEscalated: true, type: 'human_request' };
  }

  if (replyLower.includes('whatsapp') || replyLower.includes('calendly') || replyLower.includes('patient coordinator directly')) {
    return { isEscalated: true, type: 'human_request' };
  }

  return { isEscalated: false };
}

// Extraction logic for PRD §8 lead capture data model
export function extractLeadFields(messages: ChatMessage[]): Partial<LeadRecord> {
  const updates: Partial<LeadRecord> = {};
  const allText = messages.map(m => m.content).join(' ');
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  const lastUser = userMessages[userMessages.length - 1] || '';

  // Name extraction patterns
  const nameMatch = allText.match(/(?:my name is|i am|call me|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch && nameMatch[1] && !['Aria', 'Hello', 'Hi', 'Dental'].includes(nameMatch[1])) {
    updates.name = nameMatch[1];
  }

  // Country extraction
  const countryPatterns = [
    'United States', 'USA', 'US', 'UK', 'United Kingdom', 'London', 'Dubai', 'UAE', 
    'Saudi Arabia', 'Qatar', 'Kuwait', 'Germany', 'Australia', 'Canada', 'Russia', 
    'France', 'Spain', 'Switzerland', 'Ireland', 'Norway'
  ];
  for (const country of countryPatterns) {
    const regex = new RegExp(`\\b(?:from|in|traveling from|flying from|live in)\\s+${country}\\b|\\b${country}\\b`, 'i');
    if (regex.test(allText)) {
      updates.homeCountry = country;
      break;
    }
  }

  // Procedure detection
  if (/veneer|smile makeover|porcelain/i.test(allText)) {
    updates.procedureInterest = 'Smile Makeover (Porcelain Veneers)';
  } else if (/all-on-4|all on 4|full arch|full mouth/i.test(allText)) {
    updates.procedureInterest = 'Full-Mouth Rehabilitation (All-on-4/6)';
  } else if (/implant|single implant/i.test(allText)) {
    updates.procedureInterest = 'Dental Implants';
  } else if (/whitening|bleach/i.test(allText)) {
    updates.procedureInterest = 'Teeth Whitening';
  } else if (/aligner|invisalign|orthodontic/i.test(allText)) {
    updates.procedureInterest = 'Clear Aligner Orthodontics';
  }

  // Budget detection
  const budgetMatch = allText.match(/\$?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:k|thousand|\$)?(?:\s*-\s*\$?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:k|thousand)?)?/i);
  if (/\b(?:budget|spend|comfort|around)\b/i.test(allText) && budgetMatch) {
    updates.budgetBand = budgetMatch[0];
  } else if (/\$10k|\$15k|\$20k|\$5k|\$50k/i.test(allText)) {
    const match = allText.match(/\$\d+k/gi);
    if (match) updates.budgetBand = match[0];
  }

  // Timeframe detection
  const timeframeMatch = allText.match(/(?:in\s+(?:november|december|january|february|march|april|may|june|july|august|september|october)|next\s+(?:week|month|2\s+months|3\s+months)|this\s+summer|next\s+spring)/i);
  if (timeframeMatch) {
    updates.travelTimeframe = timeframeMatch[0];
  }

  // Contact method detection (email, phone, whatsapp)
  const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = allText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (emailMatch) {
    updates.preferredContact = emailMatch[0];
  } else if (phoneMatch) {
    updates.preferredContact = phoneMatch[0];
  } else if (/whatsapp/i.test(allText)) {
    updates.preferredContact = 'WhatsApp (Requested)';
  }

  // Qualification status
  let filledCount = 0;
  if (updates.procedureInterest) filledCount++;
  if (updates.homeCountry) filledCount++;
  if (updates.budgetBand) filledCount++;
  if (updates.travelTimeframe) filledCount++;
  if (updates.preferredContact) filledCount++;

  if (filledCount >= 4) {
    updates.qualificationStatus = 'Fully Qualified';
  } else if (filledCount >= 2) {
    updates.qualificationStatus = 'Partially Qualified';
  } else {
    updates.qualificationStatus = 'In Discussion';
  }

  return updates;
}

// Intelligent fallback simulating Aria's verbatim guardrails & tone
function generateSimulatedReply(messages: ChatMessage[], variant: AppVariant): string {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const text = lastMsg.toLowerCase();

  if (variant === 'jws_interiors') {
    if (text.includes('budget') || text.includes('minimum') || text.includes('cost')) {
      return "For comprehensive residential and commercial transformations, JWS Interiors typically takes on projects starting from roughly $50,000 in total design and procurement scope. Because each residence requires tailored architectural concepting and bespoke sourcing, exact fees are established during an initial design consultation with our principal. What is the approximate square footage or room count you have in mind?";
    }
    if (text.includes('book') || text.includes('consultation')) {
      return "I would be delighted to arrange a discovery consultation directly with our principal designer. You can select a dedicated 30-minute studio walkthrough via our calendar, or leave your preferred email and phone number and our studio manager will coordinate with you today.";
    }
    return "Thank you for reaching out to JWS Interiors. As an AI design consultant, I'm here to explore your vision. Could you share what kind of property you're envisioning transforming, where it's located, and your ideal timeline?";
  }

  // --- DAZZLE DENTAL (ARIA) RULES ---

  // 1. Exact Price refusal guardrail (TRD §7)
  if (
    text.includes('exact cost') || 
    text.includes('exact price') || 
    text.includes('precise number') || 
    text.includes('binding quote') ||
    (text.includes('exact') && text.includes('veneer'))
  ) {
    return "I completely understand wanting clarity on financial planning. However, because every smile is biologically unique—requiring specific prep depth, bite calibration, and material craftsmanship—I cannot provide a single binding price before a clinician assesses your case.\n\nFor our international patients, handcrafted porcelain veneers (8–10 teeth) typically range between $4,500 and $9,000 in total. A definitive treatment plan and exact quote are finalized only after our prosthodontists review your high-res dental photos or X-rays.\n\nWould you like me to share our secure link to submit your photos for a complimentary clinician review?";
  }

  // 2. Symptom & Urgent Pain Guardrail (TRD §7)
  if (
    text.includes('pain') || 
    text.includes('throbbing') || 
    text.includes('swelling') || 
    text.includes('toothache') || 
    text.includes('broken tooth') || 
    text.includes('amoxicillin')
  ) {
    return "I am so sorry to hear you're experiencing pain and swelling. As an AI concierge, I cannot clinically diagnose symptoms or recommend medications such as antibiotics.\n\nBecause acute swelling and throbbing pain can indicate an active infection requiring immediate clinical intervention, please contact our on-duty emergency clinical team directly via WhatsApp at +971 50 123 4567 or visit your nearest urgent dental care center right away. May I connect you with our clinical coordinator now?";
  }

  // 3. Multilingual handling: Arabic
  if (/[\u0600-\u06FF]/.test(lastMsg) || text.includes('arabic') || text.includes('العربية')) {
    return "أهلاً بك في دازل لطب الأسنان (Dazzle Dental)! أنا آريا، المساعد الذكي للعيادة ومتاحة على مدار 24 ساعة لخدمتك.\n\nبالنسبة لمرضانا القادمين من الخارج، تتراوح تكلفة زراعة الأسنان عادة بين 900 و1,600 دولار أمريكي للسن الواحد، وتستغرق الزيارة الأولى عادة من 3 إلى 5 أيام مع خدمة الاستقبال من المطار وتوفير أسعار خاصة في فنادق 5 نجوم شريكة. كما يتوفر لدينا فريق يتحدث العربية بطلاقة لمرافقتك في كل خطوة.\n\nمن أي مدينة أو دولة تخطط للسفر، وما هو التاريخ المناسب لك؟";
  }

  // 4. Multilingual handling: Spanish
  if (text.includes('español') || text.includes('cuanto cuesta') || text.includes('precio') || text.includes('hola') || text.includes('carillas')) {
    return "¡Hola! Soy Aria, la conserje de inteligencia artificial de Dazzle Dental, disponible las 24 horas para asistirte.\n\nPara nuestros pacientes internacionales, un diseño de sonrisa completo con 8 a 10 carillas de porcelana de alta estética suele oscilar entre $4,500 y $9,000 USD, completándose típicamente en 5 a 8 días en la clínica. Además, incluimos el traslado privado desde el aeropuerto y convenios con hoteles 5 estrellas.\n\n¿Desde qué país viajarías y para qué fecha estás planeando tu visita?";
  }

  // 5. Multilingual handling: Russian
  if (/[\u0400-\u04FF]/.test(lastMsg) || text.includes('russian')) {
    return "Здравствуйте! Я Ария, ИИ-консьерж клиники Dazzle Dental, доступная круглосуточно. Для наших международных пациентов стоимость установки одного импланта обычно составляет от $900 до $1,600, а преображение улыбки (виниры) — от $4,500 до $9,000. В программу входит встреча в аэропорту и русскоязычный координатор. Из какой страны вы планируете поездку?";
  }

  // 6. Multilingual handling: German
  if (text.includes('deutsch') || text.includes('kosten') || text.includes('guten tag') || text.includes('zahn')) {
    return "Guten Tag! Ich bin Aria, die KI-Concierge von Dazzle Dental. Für unsere internationalen Patienten liegt ein vollständiges Smile Makeover (8–10 Veneers) typischerweise zwischen 4.500 $ und 9.000 $, bei einer Aufenthaltsdauer von 5–8 Tagen vor Ort. VIP-Flughafentransfer und deutschsprachige Betreuung sind inbegriffen. Aus welcher Stadt planen Sie Ihre Anreise?";
  }

  // 7. Booking escalation trigger
  if (text.includes('book') || text.includes('appointment') || text.includes('confirm my') || text.includes('reserve')) {
    return "Wonderful! I would be delighted to connect you directly with our International Patient Coordinator to reserve your preferred treatment dates and review travel logistics.\n\nThis is best handled directly by our senior team: you can message our WhatsApp priority line at +971 50 123 4567, or schedule a free 15-minute video consultation through our direct booking link. If you prefer, what is your WhatsApp number or email address, and our coordinator will reach out to you within 2 hours?";
  }

  // 8. Procedure / Cost exploration
  if (text.includes('smile makeover') || text.includes('veneer') || text.includes('teeth whitening')) {
    return "A full smile makeover at Dazzle Dental typically involves 8 to 10 custom porcelain veneers (crafted with ultrathin Swiss/German feldspathic or E-max ceramic). For our international visitors, this typically ranges from $4,500 to $9,000 depending on preparatory work and ceramic grade.\n\nThe process is designed for travelers: it is completed in 5 to 8 days on-site across two comfortable appointments, leaving plenty of time to enjoy the city. What timeframe are you considering for your trip?";
  }

  if (text.includes('implant') || text.includes('all-on-4') || text.includes('all on 4') || text.includes('missing teeth')) {
    return "For implantology, a single premium Swiss/German titanium or zirconia implant typically ranges from $900 to $1,600 (including custom abutment and temporary). For full-arch rehabilitation (All-on-4 or All-on-6 with monolithic fixed zirconia), the range is typically $12,000 to $25,000 per arch.\n\nAll surgical cases utilize computer-guided 3D placement for maximum safety and same-day provisional teeth. Have you previously had a 3D dental CBCT scan taken in your home country?";
  }

  if (text.includes('travel') || text.includes('airport') || text.includes('hotel') || text.includes('stay') || text.includes('days')) {
    return "We specialize in making your medical visit effortless. For all international procedures, Dazzle Dental includes:\n- Private VIP airport chauffeur on arrival and departure\n- Preferential partner rates at luxury 5-star hotels within 8 minutes of our clinic\n- Dedicated multilingual patient host throughout your stay\n- Comprehensive international warranty and follow-up protocol with your home dentist\n\nMost cosmetic visits require just 5 to 8 days. Where would you be flying from?";
  }

  // 9. Off-topic deflection guardrail
  if (text.includes('world cup') || text.includes('weather') || text.includes('crypto') || text.includes('football') || text.includes('president')) {
    return "While that's an interesting topic, my dedicated role is assisting international patients with their dental treatments and travel arrangements at Dazzle Dental! I would love to help you plan your smile journey—are you looking into veneers, dental implants, or full restoration?";
  }

  // Default conversational qualifier
  return "Thank you for asking. As Aria, Dazzle Dental's AI concierge, I'm available 24/7 to guide you through procedure timelines, typical price ranges, and our international travel support.\n\nTo ensure I provide the most helpful guidance: could you tell me which treatment you are exploring, and roughly which month or season you're hoping to travel?";
}
