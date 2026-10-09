'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader, Volume2, VolumeX, Camera, Upload } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import PropertyPhotoAnalysisCard from '@/components/property-photo-analysis-card';
import { authHeaders } from '@/lib/api-token';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  poweredByAI?: boolean;
  detectedLanguage?: 'en' | 'ar';
  isPlaying?: boolean;
  photoAnalysis?: any;
  photoUrl?: string;
}

interface AIAdvisorChatProps {
  language?: NavLanguage;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = {
  en: [
    'Best markets for 10π investment?',
    'Off-plan vs tokenized ROI?',
    'Golden Visa programs overview?',
    'Mortgage tips for USA properties?',
    'Egypt rental market analysis?',
    'Pi payment advantages?',
  ],
  ar: [
    'أفضل الأسواق لاستثمار 10π؟',
    'مقارنة ROI للمشاريع والرمزية؟',
    'نظرة على برامج التأشيرة الذهبية؟',
    'نصائح الرهن العقاري الأمريكي؟',
    'تحليل سوق الإيجار المصري؟',
    'مميزات دفع Pi؟',
  ],
};

// Text-to-Speech utility
const speakMessage = (text: string, language: NavLanguage = 'en', onComplete?: () => void) => {
  // Check browser support
  if (!window.speechSynthesis) {
    console.warn('[v0] Speech Synthesis not supported');
    return;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language
  utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Handle completion
  utterance.onend = () => {
    if (onComplete) onComplete();
  };

  // Speak
  window.speechSynthesis.speak(utterance);
};

const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

// Legal Framework by Country
const LEGAL_FRAMEWORK = {
  en: {
    UAE: `🏛️ UAE PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Permitted in designated freehold zones (Dubai Marina, Business Bay, etc.)
• Property registration: Mandatory via DLD (Dubai Land Department)
• Leasehold: Up to 99 years maximum in specified areas
• Full ownership: Available in select free zones

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Valid passport & residency visa
2. Power of attorney (if not personally present)
3. Mortgage certificate (if financed)
4. Approved property inspection
5. Property title clearance from DLD

💼 CONTRACT ESSENTIALS:
✓ Sale & Purchase Agreement (SPA) in English & Arabic
✓ Clear title with No Objection Certificate (NOC)
✓ Utility connections verified (DEWA)
✓ Building completion certificate for off-plans
✓ Escrow account for buyer protection
✓ MOU (Memorandum of Understanding) for preliminary terms

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing in non-freehold zone without lease
✗ Paying before registered in DLD system
✗ Missing NOC from original owner
✗ Incomplete building documentation
✗ Buyer not mentioned in post-registration title

✅ DUE DILIGENCE CHECKLIST:
☐ Verify property title with DLD
☐ Check for building permit & completion certificate
☐ Confirm utilities (water, electricity, internet)
☐ Review master plan and plot location
☐ Verify developer credibility & track record
☐ Check for outstanding mortgages or liens
☐ Inspect building structure & finishes
☐ Review community rules & amenities
☐ Get legal review of sales contract
☐ Register with DLD within 30 days of completion

🛡️ LEGAL PROTECTIONS:
• Off-plan buyer protection via escrow accounts
• 2-5 year defect liability period (snagging)
• Mandatory builder's guarantee
• Property insurance available
• Rental cap protections in some emirates

💰 TAX & FINANCIAL CONSIDERATIONS:
• Property transfer tax: 2-4% (varies by emirate)
• No income tax on rental returns
• Annual registration fee: 0.1-0.2% of value
• Capital gains: Tax-free in UAE`,

    Egypt: `🏛️ EGYPT PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Restricted (certain zones allowed)
• Egyptian citizens: Full ownership rights
• Leasehold: Up to 50 years renewable
• New Administrative Capital: Special foreign investor zones available
• Coastal properties: Restrictions for non-Egyptians

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Foreign Investment Authority (FIA) approval
2. Valid passport & certificate of marital status
3. Embassy notarization of documents
4. Property inspection by certified surveyor
5. Mortgage pre-approval (if applicable)

💼 CONTRACT ESSENTIALS:
✓ Power of Attorney in Arabic
✓ Property title deed (Sند) verification
✓ Land registry certificate
✓ No disputes or encumbrances letter
✓ Building permit & occupancy certificate
✓ Utility connections proof
✓ Neighborhood/municipality clearance

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing without FIA approval
✗ Informal agreements (not registered)
✗ Missing original title deeds
✗ Disputes with previous owners
✗ Building permit violations
✗ Incomplete documentation

✅ DUE DILIGENCE CHECKLIST:
☐ Get FIA pre-approval for foreign ownership
☐ Verify property title in Land Registry
☐ Check building regulations compliance
☐ Confirm municipal taxes paid
☐ Inspect property condition thoroughly
☐ Verify seller's identity & ownership
☐ Check for mortgages or debts
☐ Review building maintenance records
☐ Verify utilities operational
☐ Have contract reviewed by Egyptian lawyer
☐ Register at Land Registry within 1 month

🛡️ LEGAL PROTECTIONS:
• Land Registry provides ownership proof
• Government regulation of developer conduct
• Rental contract standard terms
• Buyer protection in off-plan projects
• Dispute resolution through courts

💰 TAX & FINANCIAL CONSIDERATIONS:
• Transfer tax: 2.5% on purchase price
• Annual property tax: 0.5-1.5% of value
• Rental income tax: 10% (negotiable)
• No capital gains tax on personal property`,

    Saudi: `🏛️ SAUDI ARABIA PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Limited to commercial zones & specific areas
• GCC nationals: Prefer equal rights with locals
• Saudi citizens: Unrestricted ownership
• Freehold: Varies by region & property type
• Leasehold: Up to 50 years, renewable

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Foreign investor visa or work permit
2. Valid passport & notarized documents
3. Ministry of Housing approval
4. Bank account in Saudi Arabia
5. Murabaha financing (Islamic financing)

💼 CONTRACT ESSENTIALS:
✓ Sales & Purchase Agreement (Sharia-compliant)
✓ Property registration with Zoning Authority
✓ No objection from homeowner association
✓ Proof of building license
✓ Occupancy certificate
✓ Clear title deed (Sند)
✓ Utility verification letters

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing without Ministry approval
✗ Non-Sharia-compliant contract terms
✗ Unregistered properties
✗ Missing building licenses
✗ Disputes with community committees
✗ Overdue municipal fees

✅ DUE DILIGENCE CHECKLIST:
☐ Get Ministry of Housing approval
☐ Verify property in official registry
☐ Check building code compliance
☐ Confirm municipal permits valid
☐ Inspect building & structural integrity
☐ Verify seller legitimacy
☐ Check HOA fees & standing
☐ Review Sharia-compliant financing terms
☐ Get contract reviewed by local lawyer
☐ Register property within 2 months
☐ Verify utility account transferability

🛡️ LEGAL PROTECTIONS:
• Sharia-based contract enforcement
• Government developer regulation
• Building code enforcement
• Homeowner association protections
• Dispute resolution through Islamic courts

💰 TAX & FINANCIAL CONSIDERATIONS:
• No property transfer tax for Saudi nationals
• Foreign investors: 2.5% transfer fee
• Annual municipality fees: 0.5-1%
• No rental income tax (varies)
• Islamic financing mandatory for some buyers`,

    USA: `🏛️ USA PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Generally permitted (state variations)
• Freehold: Standard for residential properties
• Leasehold: Rare, mostly in Hawaii & some commercial
• Restrictions: Some states limit foreign investment in agricultural land
• FIRPTA: Foreign Investment in Real Property Tax Act applies

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Valid passport & ITIN (Individual Tax ID Number)
2. US bank account recommended
3. Proof of funds or mortgage pre-approval
4. Title insurance commitment
5. Property inspection report
6. Environmental assessment (if applicable)

💼 CONTRACT ESSENTIALS:
✓ Purchase & Sales Agreement
✓ Title insurance policy (owner's & lender's)
✓ Contingency clauses (inspection, appraisal, financing)
✓ Homeowners Association (HOA) documents
✓ Disclosure statements (lead-based paint, flood zones)
✓ Survey or legal description of property
✓ Certificate of occupancy
✓ Property tax assessment documents

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing in flood zones without awareness
✗ Title defects or liens not caught by insurance
✗ HOA violations or pending special assessments
✗ Environmental contamination issues
✗ Structural problems found after closing
✗ Missing permits for renovations

✅ DUE DILIGENCE CHECKLIST:
☐ Obtain title insurance commitment
☐ Get comprehensive home inspection
☐ Review HOA documents & financials
☐ Check flood zone & environmental status
☐ Verify property taxes & payment history
☐ Confirm utility availability & costs
☐ Get appraisal for financing
☐ Review all disclosure documents
☐ Inspect for lead paint (pre-1978 homes)
☐ Get attorney review (highly recommended)
☐ Verify seller's legitimate ownership
☐ Check for building code violations
☐ Review easements & restrictions
☐ Close through licensed escrow/attorney

🛡️ LEGAL PROTECTIONS:
• Title insurance (comprehensive coverage)
• Contingency periods for inspections
• Attorney General consumer protections
• State-specific disclosure requirements
• Homeowners insurance availability
• HOA regulations & enforcement
• Environmental protection laws

💰 TAX & FINANCIAL CONSIDERATIONS:
• Transfer tax: 0.5-2% (varies by state/county)
• Property tax: 0.5-2.5% annually (state-dependent)
• Mortgage interest: Tax-deductible
• Capital gains: 15-20% federal (varies)
• FIRPTA withholding: 15% on foreign seller proceeds
• State/local income taxes vary`,

    UK: `🏛️ UK PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Fully permitted (no restrictions)
• Freehold: Absolute ownership with permanent tenure
• Leasehold: Time-limited ownership (typically 99+ years)
• Commonhold: Rare alternative to leasehold
• Right to Buy: Not available to foreign investors

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Valid passport & proof of identification
2. Proof of funds (source of money verification)
3. Solicitor engagement & conveyancing
4. Property survey (optional but recommended)
5. Mortgage in principle (if financing)
6. Building insurance arranged

💼 CONTRACT ESSENTIALS:
✓ Terms & Conditions of Sale
✓ Leasehold Information Form (if leasehold)
✓ Property Information Forms (TA6/TA7)
✓ Energy Performance Certificate (EPC)
✓ Building Survey Report
✓ Local Authority Search
✓ Environmental Search
✓ Drainage & Water Search
✓ Title Register (Land Registry)
✓ Local Tenant Rights (if buy-to-let)

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing leasehold with < 80 years remaining
✗ Ground rent escalation clauses
✗ Service charge disputes with leaseholders
✗ Subsidence or structural defects
✗ Onerous restrictive covenants
✗ Defective title or boundary disputes

✅ DUE DILIGENCE CHECKLIST:
☐ Instruct qualified solicitor
☐ Get comprehensive building survey
☐ Order Property Information Reports
☐ Conduct Local Authority Search
☐ Perform Environmental Search
☐ Check Building Regulation approvals
☐ Verify seller's right to sell
☐ Review leasehold documents if applicable
☐ Check ground rent & service charges
☐ Arrange Building Insurance pre-completion
☐ Verify utilities connected & functioning
☐ Check stamp duty implications
☐ Review tenancy agreements (if buy-to-let)
☐ Get mortgage offer in principle
☐ Final walkthrough before completion

🛡️ LEGAL PROTECTIONS:
• Title Register (government guaranteed)
• Leasehold statutory protections
• Building Regulations enforcement
• Consumer Rights Act protections
• Caveat Emptor principle (but full disclosure required)
• Solicitor indemnity insurance available
• Property Misdescriptions Act

💰 TAX & FINANCIAL CONSIDERATIONS:
• Stamp Duty Land Tax (SDLT): 0-15% (progressive)
• Annual property tax: Council Tax (residential)
• Capital gains: 20% on gain (not principal residence)
• Rental income: 20% income tax + NI (varies)
• Mortgage interest: Non-deductible
• Foreign investment: No restrictions on repatriation`,

    Singapore: `🏛️ SINGAPORE PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Generally permitted, subject to ABSD (Additional Buyer's Stamp Duty)
• Foreign buyers: 60% ABSD (as of 2023) on top of standard BSD
• Singapore citizens/PRs: Lower or no ABSD
• Freehold: Available for most properties
• Leasehold: 99-year leasehold common

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Valid passport & FM3/visa for foreign buyers
2. Proof of funds (bank reference, tax returns)
3. Approval from Ministry of Law (SingPass) — typically automated
4. Option to Purchase (OTP) from seller/developer
5. Completion of Sale & Purchase Agreement (SPA)
6. Property inspection & valuation
7. Payment of ABSD + BSD within 14 days of exercise

💼 CONTRACT ESSENTIALS:
✓ Option to Purchase (OTP) — signed first
✓ Sale & Purchase Agreement (SPA)
✓ Proof of ABSD/BSD payment
✓ Title deed verification (SingRegister)
✓ Property tax clearance confirmation
✓ CPF usage declaration (for citizens/PRs)

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing without verifying ownership history
✗ Buying without understanding ABSD implications
✗ Leasehold properties near expiry (less than 30 years)
✗ Properties with outstanding dues (maintenance, management fees)
✗ Non-compliance with property cooling measures
✗ Unlicensed property agents used

✅ DUE DILIGENCE CHECKLIST:
☐ Verify ownership via SingRegister
☐ Check property's maintenance history & reserves
☐ Confirm ABSD/BSD payment schedule
☐ Review Management Corporation (MS) financial health
☐ Check for outstanding legal disputes
☐ Verify leasehold remaining term (if leasehold)
☐ Engage a qualified Singapore property lawyer
☐ Verify agent's CEA registration
☐ Check development highlights & completion status
☐ Get property tax clearance (IRAS)

🛡️ LEGAL PROTECTIONS:
• SingRegister provides definitive ownership records
• CEA regulates licensed property agents
• SLA (Singapore Land Authority) manages land ownership
• Property cooling measures (min. 3-month wait for resale)
• MOM/HDB restrictions apply (for HDB flats)
• Developer's warranty for new properties

💰 TAX & FINANCIAL CONSIDERATIONS:
• Buyer's Stamp Duty (BSD): 1-4% progressive rates
• Additional Buyer's Stamp Duty (ABSD): 60% for foreigners
• Seller's Stamp Duty (SSD): 12% (if sold within 1 year), 8% (1-2 years), 4% (2-3 years)
• Property tax: Owner-occupied (0-16%), Non-owner (12-32%)
• No capital gains tax on property in Singapore
• Rental income subject to income tax (progressive)
• Monthly management fees: SGD 200-800 for condos
• Legal fees: SGD 2,500-5,000 typical for purchase`,

    Japan: `🏛️ JAPAN PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Permitted without restrictions (no visa or residency required)
• Japan citizens: Full ownership rights
• Freehold: Most common — Land + Building ownership
• Leasehold: Less common, mainly for commercial/long-term
• No minimum residency or nationality requirements

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Valid passport (no visa required to buy property)
2. Personal seal (印鑑/inkan) — traditional or digital equivalent
3. Bank account in Japan (recommended for payments)
4. Japanese phone number for communications
5. Power of Attorney (if not personally present)
6. Property survey & inspection by licensed inspector
7. Title registration at Legal Affairs Bureau (法務局)

💼 CONTRACT ESSENTIALS:
✓ Sales and Purchase Agreement (売買契約書)
✓ Important Matters Explanation (重要事項説明) — required by law
✓ Building confirmation certificate (確認書)
✓ Property title certificate (権利証)
✓ Tax withholding certificate (if applicable)
✓ Stamp duty on contract (both parties)
✓ Brokerage agreement with licensed agent

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing without proper Important Matters Explanation
✗ Properties with unresolved legal disputes
✗ Buildings with severe structural issues (check inspection report)
✗ Non-compliant renovations or building code violations
✗ Unauthorized subletting by existing tenants
✗ Inheritance disputes (if inherited property)
✗ Missing or incomplete title documents

✅ DUE DILIGENCE CHECKLIST:
☐ Get licensed property inspection (インスペクション)
☐ Verify title at Legal Affairs Bureau (法務局)
☐ Review Important Matters Explanation document
☐ Check property condition & earthquake resistance
☐ Verify building's registration & permits
☐ Check building's management association rules
☐ Confirm property tax & fixed asset tax status
☐ Verify real estate agent's license (宅地建物取引士)
☐ Understand property's zoning restrictions
☐ Get Japanese real estate lawyer review
☐ Check for any superficies or easements (地上権・地役権)
☐ Confirm no existing tenant rights issues

🛡️ LEGAL PROTECTIONS:
• Real estate transaction law (宅地建物取引法) protects buyers
• Important Matters Explanation is mandatory
• Licensed agents (宅建士) bound by professional conduct
• Building Standards Act (建築基準法) — safety/codes
• Japanese courts handle property disputes
• Title registration provides strong ownership proof

💰 TAX & FINANCIAL CONSIDERATIONS:
• Acquisition tax (登録免許税): 2-4% on assessed value
• Real estate acquisition tax (不動産取得税): 3-4% on assessed value
• Fixed asset tax (固定資産税): 1.4% annually on assessed value
• City planning tax (都市計画税): 0.3-1.6% annually (urban areas)
• Stamp duty: ¥10,000-¥600,000 depending on contract value
• Capital gains tax: 15.315% (national) + 5-10% (local) for long-term; 30.63% + 10% for short-term (<5 years)
• No wealth tax or inheritance tax on foreign owners (if non-resident)
• Agent commission: 3-4% + ¥60,000-¥100,000 (standard)`,

    Australia: `🏛️ AUSTRALIA PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Permitted — FIRB (Foreign Investment Review Board) approval mandatory
• Australian citizens/PRs: Full ownership rights
• Foreign buyers: Must apply for FIRB approval before purchase
• Freehold (Torrens title): Most common residential ownership
• Leasehold: Common in rural/agricultural, some urban areas

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Valid passport & FIRB application/approval (mandatory)
2. Tax File Number (TFN) — for property tax purposes
3. Australian bank account (recommended for settlement)
4. Signed Contract of Sale (prepared by solicitor/conveyancer)
5. Building & pest inspection reports
6. Property title search (prepared by conveyancer)
7. Stamp duty payment (varies by state)
8. Settlement (final transfer of ownership)

💼 CONTRACT ESSENTIALS:
✓ Contract of Sale (prepared by vendor's solicitor)
✓ Vendor's Statement / Section 32 (disclosure document)
✓ Building inspection report
✓ Pest inspection report (separate or combined)
✓ Settlement statement (adjustments, rates, taxes)
✓ Stamp duty payment confirmation
✓ Title transfer registration (Land Registry)
✓ FIRB approval documentation

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing without FIRB approval — penalties up to 250,000 AUD + 3x profit
✗ Buying at auction without proper due diligence (contract binding immediately)
✗ Properties with undisclosed building defects
✗ Flood-prone or bushfire-prone zones (may require disclosure)
✗ Overspending — no cooling-off period for auction purchases
✗ Strata/Community title issues — complex OC rules
✗ Off-the-plan developments — risk of delays/cancellations
✗ Existing tenancy — tenant rights take priority

✅ DUE DILIGENCE CHECKLIST:
☐ Obtain FIRB approval before making any offer
☐ Conduct building inspection by licensed inspector
☐ Conduct pest inspection (termites, etc.)
☐ Review Vendor's Statement (Section 32) — all disclosures
☐ Check flood maps, bushfire zones, planning overlays
☐ Verify zoning, planning permits, development restrictions
☐ Review strata minutes & by-laws (if apartment/townhouse)
☐ Confirm property's title (search with Land Registry)
☐ Check outstanding rates, taxes, utilities
☐ Engage Australian solicitor/conveyancer for settlement
☐ Verify contract terms, cooling-off rights (if any)
☐ Check recent comparable sales in area
☐ Confirm tenant status (if tenanted property)

🛡️ LEGAL PROTECTIONS:
• FIRB approval mandatory for foreign buyers — enforced with penalties
• State-based Conveyancing Acts govern property transactions
• Vendor's Statement (Section 32) mandatory disclosure
• State-based seller disclosure laws (varies)
• State Fair Trading / Consumer protection agencies
• Building inspection industry standards & licensing
• Land Registry provides incontestable title (Torrens system)

💰 TAX & FINANCIAL CONSIDERATIONS:
• Stamp duty: Varies by state (NSW 4-5.5%, VIC 5.5-7%, etc.) — can be 10%+ for foreign buyers
• FIRB application fee: AUD 13,200+ for residential buildings over AUD 1M
• Annual property tax: Varies (varies by state, 0.5-2.5% of assessed value)
• Land tax: Additional state tax above threshold
• Capital gains tax (CGT): 50% discount for 12+ months holding; applies to disposal
• Rental income tax: Taxed as income (30%+ for foreign investors)
• No inheritance tax in Australia
• Conveyancing/legal fees: AUD 1,500-4,000 typical
• Building/pest inspections: AUD 500-1,200 combined`,

    'Hong Kong': `🏛️ HONG KONG PROPERTY LAWS & LEGAL FRAMEWORK:

📋 OWNERSHIP RIGHTS:
• Foreign ownership: Permitted — Hong Kong has no restrictions on foreigners owning property
• Hong Kong citizens/PRs: Full ownership rights
• Freehold: Most common — land technically leasehold (government grants)
• Leasehold: Government leases typically 50/75/999 years (most old grants)
• No restrictions based on nationality or residency

⚖️ LEGAL REQUIREMENTS FOR PURCHASE:
1. Valid passport (foreign buyers) — no additional residency requirements
2. Sale & Purchase Agreement (SPA) — standard Hong Kong form
3. Provisional SPA (if negotiated before formal SPA)
4. Completion of property search at Land Registry
5. Appointment of a solicitor/conveyancer (highly recommended)
6. Stamp duty payment (HKAD, BSD as applicable)
7. Property valuation (for mortgage purposes, if applicable)
8. Completion meeting — transfer of title

💼 CONTRACT ESSENTIALS:
✓ Provisional Sale & Purchase Agreement (if applicable)
✓ Formal Sale & Purchase Agreement (SPA)
✓ Title search report from Land Registry
✓ Property tax clearance (Rates & Government Rent)
✓ Building management by-laws / Deed of Mutual Covenant
✓ Stamp duty assessment & payment
✓ Mortgage deed (if financed)
✓ Completion statement & money receipt

⚠️ LEGAL RISKS & RED FLAGS:
✗ Purchasing without proper title search — verify at Land Registry
✗ Buying uncompleted developments — developer default risk
✗ Properties with litigation or encumbrance (check Land Registry)
✗ Non-compliant building works (unauthorized structures/alterations)
✗ Outstanding maintenance fees or government rates
✗ Properties with tenant in occupation (tenant rights protected)
✗ Strata management disputes (management company issues)
✗ Expropriation risk — government may compulsorily acquire land

✅ DUE DILIGENCE CHECKLIST:
☐ Conduct formal title search at Lands Registry
☐ Check for litigation, encumbrances, liens on property
☐ Review Deed of Mutual Covenant (building by-laws)
☐ Verify management company financial health
☐ Obtain latest rates & government rent statements
☐ Check completion certificates (if new building)
☐ Inspect property condition thoroughly
☐ Verify developer's track record (for uncompleted projects)
☐ Check for unauthorized structures/alterations
☐ Engage Hong Kong solicitor for conveyancing
☐ Confirm stamp duty payment amounts
☐ Verify property's zoning & planning restrictions
☐ Review building's sinking fund health

🛡️ LEGAL PROTECTIONS:
• Land Registry provides definitive title records
• Conveyancing by solicitor standard practice
• Seller's statutory declaration of no litigation/encumbrance
• Buildings Ordinance — regulates construction standards
• Tenant protection — tenant rights before eviction
• Consumer Council oversight for consumers
• HKMA regulates mortgage lending

💰 TAX & FINANCIAL CONSIDERATIONS:
• Stamp Duty (HKAD): 1.5-8.5% of consideration (proportional scale)
• Buyer's Stamp Duty (BSD): 15% flat — applies to foreign buyers and non-permanent residents
• Seller's Stamp Duty (SSD): 10% if sold within 1 year, 20% if within 2 years (as of 2023)
• Property tax (Rates): 5% of rateable value annually (approx.)
• Government Rent: 3% of rateable value (payable every 6 months, or 5.6% if not reinvested)
• Capital gains tax: No capital gains tax in Hong Kong
• Estate duty (inheritance tax): No estate duty since 2006
• Agent commission: Typically 1% each side (total 2%) of purchase price
• Legal fees: HKD 8,000-20,000 typical for residential conveyancing`,
  },
  ar: {
    UAE: `🏛️ قوانين الملكية في الإمارات:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة في مناطق الملكية الحرة المحددة (دبي مارينا، دبي للأعمال، دبي سنترال، Lagos Island، وغيرها)
• التسجيل: إجباري عبر دائرة الأراضي والأملاك (DLD) في فترة زمنية محددة
• الإيجار: حتى 99 سنة في المناطق المحددة
• الملكية الكاملة: متاحة في مناطق الحرية المحددة فقط
• المشاركة في الملكية: مسموح في بعض المناطق

⚖️ المتطلبات القانونية للشراء:
1. جواز سفر ساري المفعول وتأشيرة إقامة سارية
2. إذن مسبق (إذا لم تكن حاضرًا شخصياً)
3. شهادة رهن عقاري (عند التمويل)
4. فحص عقاري معتمد من مفتش معتمد
5. شهادة خلو الملكية من التكاليل من DLD
6. حساب توقيع (إذا كان المشتري شركة)
7. اتفاقية التسعير واتفاقية المسؤولية

💼 عناصر العقد الأساسية:
✓ عقد البيع والشراء (SPA) باللغتين الإنجليزية والعربية
✓ شهادة عدم معارضة (NOC) من المطور أو الملاك الأصلي
✓ شهادة إكتمال المبنى للمشاريع pending
✓ حساب وديعة لحماية المشتري - إجباري
✓ اتفاقية تفاهم (MOU) للشروط الأولية
✓ سجل الممتلكات الواضح ومعتمد من DLD
✓ شهادة تركيب المرافق (DEWA)
✓ شهادة توصيلات المرافق

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء في المنطقة غير الحرة بدون إيجار رسمي
✗ الدفع قبل التسجيل في نظام DLD
✗ فقدان شهادة NOC من المالك الأصلي
✗ نقص وثائق البناء والإتمام
✗ عدم ذكر المشتري في بطاقة الملكية بعد التسجيل
✗ شراء دون التحقق من دليل البناء
✗ عدم وجود رخصة البناء أو شهادة الإتمام
✗ استخدام وسيط غير مرخص
✗ تخفيضات غير مصرح بها

✅ قائمة الفحص الشاملة:
☐ التحقق من سند الملكية في DLD
☐ التحقق من رخصة البناء وشهادة الإتمام
☐ التحقق من فواتير المرافق (مياه، كهرباء، إنترنت)
☐ مراجعة الخطة الشاملة وموقع القطعة
☐ التحقق من مصداقية المطور وسجله
☐ البحث عن رهون أو ديون مستحقة على العقار
☐ فحص هيكل المبنى والإنجازات
☐ مراجعة قواعد المجتمع والمرافق
☐ الحصول على مراجعة قانونية لعقد البيع
☐ التسجيل في DLD خلال 30 يومًا من الإتمام
☐ التحقق من جميع الواصفات في البطاقة النهائية
☐ التأكد من شمول جميع الأجهزة والمرافق
☐ مراجعة عقود الصيانة والخدمات المجتمعية

🛡️ الحمايات القانونية:
• حماية المشتري في المشاريع pending عبر حسابات الوديعة
• فترة مسؤولية العيوب 2-5 سنوات (اعتراضات)
• ضمان إجباري من البناء للعقارات الجديدة
• تأمين العقار متاح
• حمايات سقف الإيجار في بعض الإمارات
• قوانين حماية المستهلك في معاملات العقارات
• مراقبة دائرة الأراضي للمطورين
• سجل الشكاوى الرسمي لـ DLD

💰 اعتبارات الضرائب والمالية:
• ضريبة تحويل العقار: 2-4% (تختلف حسب الإمارة)
• لا ضرائب على دخل الإيجار للإيجار الرئيسي
• رسوم التسجيل السنوية: 0.1-0.2% من القيمة
• الأرباح الرأسمالية: معفاة من الضرائب في الإمارات
• رسوم إضافية: 0.25% رسوم خدمة DLD, 0.15% رسوم administration
• قيمة الإضافة للضريبة: 5% على الخدمات داخل الممتلكات
• إمكانية استخدام تحسينات رهن عقاري متاحة في بعض الحالات`,

    Egypt: `🏛️ قوانين الملكية في مصر:

📋 حقوق الملكية:
• ملكية الأجانب: محدودة (مناطق معينة مسموحة للاستثمار)
• المواطنون المصريون: حقوق ملكية كاملة غير مقيدة
• الإيجار: حتى 50 سنة قابلة للتجديد مع اتفاق كتابي
• العاصمة الإدارية: مناطق خاصة للمستثمرين الأجانب
• العقارات الساحلية: قيود على غير المصريين

⚖️ المتطلبات القانونية للشراء:
1. موافقة هيئة تنمية الاستثمار (FIA) للمستثمرين الأجانب
2. جواز سفر ساري المفعول وشهادة حالة مدنية موثقة
3. تصديق سفارة الدولة على جميع المستندات القانونية
4. فحص عقاري معتمد من مهندس معتمد من وزارة التمويع
5. موافقة مسبقة على الرهن العقاري (في حال التمويل)
6. تقرير تقييم عقاري معتمد من جهاز التقدير
7. شهادة عدم الباطل من المحكمة
8. تسجيل التعاقد مع المحاضر في السجل العقاري

💼 عناصر العقد الأساسية:
✓ وكالة قانونية باللغة العربية وفق النظام المصري
✓ فحص سند الملكية الأصلية (سند تملك حديث)
✓ شهادة خلو من النزاعات والاختهات من المحكمة
✓ شهادة الإشغال الرسمية من الجهاز المركزي للتعبئة
✓ رخصة بناء معتمدة من المحافظة والبلدية
✓ شهادة ربط المرافق (ماء، كهرباء، غاز) معتمدة
✓ شهادة خلو من الرهون والضرائب المستحقة من الإدارة
✓ عقد بيع مع انتقالات وشرط وحقوق واضحة
✓ توقيع واعتماد جميع الأطراف وفق القانون المصري
✓ شهادة دفع الرسوم العقارية ودورتها
✓ مراجعة العقد من قبل محام مصري مرخص

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء دون الحصول على موافقة هيئة استثمار أجنبي
✗ الاتفاقيات غير الرسمية غير المسجلة رسميًا
✗ فقدان السندات الأصلية لسند الملكية أو المشتقات
✗ وجود نزاعات أو إجراءات قضائية على العقار
✗ انتهاكات تراخيص البناء أو مخالفات التخطيط
✗ عدم وجود وثائق كاملة لإثبات الملكية والتاريخ
✗ عقارات مخالفة التخطيط أو البنود العمرانية
✗ محيط غير آمن أو منطقة دون الخدمات
✗ عدم وجود تراخيص دفع الرسوم أو الالتزامات المستحقة
✗ استخدام وسيط غير مرخص من وزارة التمويل

✅ قائمة الفحص الشاملة:
☐ الحصول على موافقة هيئة تنمية الاستثمار للمستثمرين الأجانب
☐ التحقق من سند الملكية في السجل العقاري المركزي
☐ التحقق من رخصة البناء ومتطلبات العمرانية
☐ التأكد من دفع الرسوم البلدية والمستحقات
☐ فحص معماري مفصل لحالة العقار والهيكل
☐ التحقق من هوية البائع وملكيته القانونية
☐ البحث عن أي رهون مشهورة أو ديون على العقار
☐ مراجعة سجلات صيانة المبنى والمرافق الداخلية
☐ التحقق من عمل المرافق (مياه، كهرباء، غاز، إنترنت)
☐ مراجعة الشروط القانونية للعقد بواسطة محام مصري مرخص
☐ التسجيل في السجل العقاري خلال شهر واحد من الاتفاق
☐ التحقق من تقسيم المشروع والبطاقات التخطيطية
☐ مراجعة قواعد التجمع السكني والمرافق المجتمعية
☐ التأكد من الالتزام بمعايير السلامة والإنزال

🛡️ الحمايات القانونية:
• السجل العقاري يقدم دليلاً رسميًا على الملكية
• تنظيم حكومي لسلوك المطورين والمشروعات العقارية
• شروط عقد الإيجار معتمدة من الدولة
• حماية المشتري في المشاريع pending
• حل النزاعات من خلال المحاكم والمحاكم الإدارية
• وزارة التمويل: مراقبة الأنشطة العقارية
• مسؤولية الإخلال تمنح تعويضات قانونية
• تأمين العقار متاح ومرخص قانونياً

💰 اعتبارات الضرائب والمالية:
• ضريبة التحويل: 2.5% على سعر الشراء
• ضريبة العقار السنوية: 0.5-1.5% من القيمة المقدرة
• ضريبة دخل الإيجار: 10% قابلة للتفاوض والضبط
• لا ضريبة أرباح رأسمالية على العقار الشخصي
• رسوم الجهاز المركزي للتقدير: تكاليف إضافية
• رسوم السجل العقاري: رسوم ثابتة حسب الحجم
• الضريبة على زيادة الثروة: لن تطبق على الاكتسابات الشخصية
• إمكانية استخدام السحب والإيداع القانوني للوثائق abroad`,

    Saudi: `🏛️ قوانين الملكية في السعودية:

📋 حقوق الملكية:
• ملكية الأجانب: محدودة - تقتصر على المناطق التجارية والتجزئة المعينة
• مواطنو دول مجلس التعاون: حقوق متساوية مع المواطنين في بعض المناطق
• المواطنون السعوديون: ملكية غير محدودة في جميع أنحاء المملكة
• الملكية الحرة: تختلف حسب المناطق ونوع العقار
• الإيجار: حتى 50 سنة قابلة للتجديد مع اتفاق مكتوب

⚖️ المتطلبات القانونية للشراء:
1. تأشيرة استثمار أجنبي أو رخصة عمل سارية في المملكة
2. جواز سفر ساري المفعول ومستندات معتمدة من السفارة
3. موافقة مسبقة من وزارة الإسكان والتعمير
4. حساب بنكي سعودي مفتوح منشأة محلية
5. تمويل murabaha - تمويل متوافق مع الشريعة الإسلامية
6. تقرير تقييم عقاري معتمد من جهاز التقدير السعودي
7. فتح حساب بنكي والحصول على رقم هوية ضريبية سعودي (مطالبة حديثًا)
8. ترخيص استثمار عقاري من وزارة التجارة والصناعة

💼 عناصر العقد الأساسية:
✓ اتفاقية بيع وشراء متوافقة مع الشريعة الإسلامية
✓ تسجيل العقار مع سلطة التجزئة والعقارات المحلية
✓ شهادة عدم اعتراض من جمعية الملاك
✓ دليل على ترخيص بناء صادر من المدينة المنورة/الرياض
✓ شهادة occupying للعقار
✓ سند ملكية واضح ومسجل رسميًا
✓ خطابات تأكيد حالة المرافق العامة
✓ رخصة تجارية سارية (للعقارات التجارية/تجارية)
✓ تصريح مسبق من لجنة التحكيم للعقارات في البنك
✓ التحقق من الموافقة على المزايا السكانية

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء دون الحصول على موافقة وزارية مسبقة
✗ وجود شروط غير متوافقة مع الشريعة في العقد
✗ عقارات غير مسجلة في السجل العقاري الرسمي
✗ عدم وجود تراخيص بناء شرعية
✗ نزاعات مع لجان المجتمع وجمعيات المالكين
✗ مستحقات بلدية متأخرة غير مدفوعة
✗ عقارات ممنوعة أو قيد الحظر الإداري
✗ عدم وجود وثائق واضحة عن الملكية الأصيلة
✗ وجود منازعات قانونية مستمرة على العقار
✗ وسائط غير مرخصين أو غير مسجلين رسميًا

✅ قائمة الفحص الشاملة:
☐ الحصول على موافقة مسبقة من وزارة الإسكان
☐ التحقق من تسجيل العقار في السجل الرسمي
☐ التحقق من الامتثال لتراخيص البناء والكود المحلي
☐ التأكد من صلاحية التراخيص البلدية والحكومة
☐ فحص بنية المبنى والسلامة الهيكلية
☐ التحقق من شرعية البائع وملكيته الكاملة
☐ التحقق من الرسوم المدفوعة وجمعية المالكين
☐ مراجعة شروط التمويل المتوافق مع الشريعة
☐ الحصول على مراجعة قانونية لمحامٍ سعودي مرخص
☐ تسجيل العقار ضمن الموعد البالغ شهرين
☐ التحقق من قابلية نقل خدمات المرافق
☐ التحقق من مخطط المشروع وشروط التسليم
☐ مراجعة عقود الصيانة والخدمات الدورية
☐ للتأكد من عدم وجود أي قيود مسبقة على العقار

🛡️ الحمايات القانونية:
• تنفيذ العقود وفق الشريعة الإسلامية
• تنظيم حكومي صارم للمطورين والمشروعات
• تطبيق صارم لكود البناء السعودي
• حماية جمعية المالكين وحقوقها
• حل النزاعات عبر المحاكم الشرعية
• وزارة الإسكان: رقابة على العملية العقارية
• قانون حقوق المشتري العقاري الحديث
• سجل الشكاوى والتقاضي الرسمي

💰 اعتبارات الضرائب والمالية:
• لاضريبة تحويل ملكية للمواطنين السعوديين
• المستثمرون الأجانب: رسوم تحويل 2.5%
• رسوم بلدية سنوية: 0.5-1% من قيمة العقار
• لاضريبة على دخل الإيجارات (تختلف حسب الولاية)
• التمويل الإسلامي إلزامي لبعض الفئات
• رسوم الإجراءات الأولية: ثابتة حسب المنطقة
• ضريبة القيمة المضافة: 15% على الخدمات والإمكانيات داخل العقار
• إمكانية لديون متداولة وشيكات للأجانب في حالة الاستقرار`,

    USA: `🏛️ قوانين الملكية في الولايات المتحدة:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة عمومًا (تختلف القيود حسب الولاية)
• الملكية الحرة: معيار العقارات السكنية في جميع الولايات
• الإيجار: نادر جدًا، يوجد أساسًا في هاواي وبعض العقارات التجارية
• قيود: بعض الولايات تحد من الاستثمار الأجنبي في الأراضي الزراعية
• FIRPTA: تطبق قوانين الضرائب على بيع العقارات للأجانب

⚖️ المتطلبات القانونية للشراء:
1. جواز سفر ساري المفعول ورقم دافع ضرائب خاص PIN (Individual Taxpayer Identification)
2. حساب بنكي أمريكي موصى به (مستحسن)

3. إثبات الأموال أو موافقة مسبقة على الرهن العقاري
4. التزام تأمين الملكية (Title Insurance Commitment)
5. تقرير فحص العقار الشامل
6. تقييم بيئي (في الحالات المطلوبة)
7. وثائق حكومية للتحقق من الهوية
8. الإعلان عن مصدر الأموال (في العديد من الولايات)

💼 عناصر العقد الأساسية:
✓ توقيع اتفاقية الشراء والبيع (Purchase & Sale Agreement)
✓ وثيقة تأمين الملكية (Owner's + Lender's title policy)
✓ شروط الاحتياطية: الفحص، التقييم، التمويل
✓ مستندات جمعية الملاك (HOA)
✓ قوانين الإفصاح: الدهان القائم على الرصاص، مناطق الفيضانات
✓ مسح قانوني ووصف العقار (Legal description)
✓ شهادة الإقامة للسكن
✓ مستندات تقييم العقار الضريبي
✓ إفصاحات خاصة (حسب الولاية)
✓ عقود الصيانة والخدمات للمجتمع

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء في مناطق الفيضانات دون معرفة كاملة
✗ عيوب الملكية أو الرهون التي لم يكشفها التأمين
✗ انتهاكات جمعية الملاك أو تقييمات خاصة قادمة
✗ تلوث بيئي أو تلوث تربة
✗ مشاكل هيكلية تكتشف بعد الإغلاق
✗ عدم وجود تراخيص لتجديدات سابقة
✗ شروط restrictive غير واضحة في الوثائق
✗ عدم وضوح حدود العقار أو نزاعات حدودية
✗ إهمال في تقييم حالة المبنى والمحتويات

✅ قائمة الفحص الشاملة:
☐ الحصول على التزام تأمين الملكية الشامل
☐ إجراء فحص شامل للمنزل (Home Inspection)
☐ مراجعة مستندات HOA والصحة المالية للمجتمع
☐ التحقق من مناطق الفيضانات والحالة البيئية
☐ التحقق من ضرائب العقار وتاريخ الدفع
☐ التأكد من توفر المرافق وتكاليفها
☐ الحصول على تقييم للعقار لأغراض التمويل
☐ مراجعة جميع وثائق الإفصاح المطلوبة
☐ الفحص للكشف عن الديوك (في المباني قبل 1978)
☐ الحصول على مراجعة محامٍ (موصى به بشدة)
☐ التحقق من ملكية البائع الشرعية
☐ البحث عن انتهاكات قوانين البناء
☐ مراجعة الالتزامات والقيود على الأرض
☐ إغلاق الصفقة عبر محامٍ أو وسيط مفتوح موثوق
☐ التأكد من شمول جميع المحتويات في العقد
☐ مراجعة تأمين السكن قبل الإغلاق
☐ التحقق من التاريخ الكامل للملكية والرسوم
☐ مراجعة مخططات التطوير المستقبلية للمنطقة

🛡️ الحمايات القانونية:
• تأمين الملكية (تغطية شاملة وموثوقة)
• فترات احتياطية للفحص (Contingency periods)
• حمايات المستهلك من المدعي العام للولاية
• قوانين الإفصاح الخاصة بالولاية
• توفر تأمين السكن والمساكن
• تنظيمات HOA وتطبيقها
• قوانين الحماية البيئية الفيدرالية
• قوانين المباني والتصاريح المحلية

💰 اعتبارات الضرائب والمالية:
• ضريبة التحويل: 0.5-2% (تختلف حسب الولاية والمقاطعة)
• ضريبة العقار السنوية: 0.5-2.5% (تعتمد على الولاية)
• فوائد الرهن العقاري: قابلة للخصم الضريبي (في بعض الحالات)
• الأرباح الرأسمالية: 15-20% فيدرالي (تختلف حسب الحالة)
• FIRPTA: احتفاظ 15% من عائدات البيع للأجانب
• ضرائب ولاية ومحلية تختلف من ولاية لأخرى
• إمكانية وجود DEDUCTIONS ضريبية على الصيانة والإدارة
• قوانين جديدة: اعتبارًا من 2025، تغييرات ضريبية محتملة`,

    UK: `🏛️ قوانين الملكية في المملكة المتحدة:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة بالكامل بدون قيود (لا سقف للاستثمار الأجنبي)
• الملكية الحرة (Freehold): ملكية دائمة ومطلقة العقار والأرض
• الإيجار (Leasehold): ملكية محدودة المدة (عادة 99 سنة أو أكثر)
• العقارات المشتركة (Commonhold): بديل نادر للإيجار
• لا يطبق برنامج الشراء للحكومات على المستثمرين الأجانب

⚖️ المتطلبات القانونية للشراء:
1. جواز سفر ساري المفعول وتثبيت الهوية
2. إثبات الأموال (فحص مصدر الأموال مطلوب)
3. تفويض محامٍ متخصص في عمليات التحويل (pConveyancing)
4. تقرير فحص العقار (فحص شامل م/Buildings Survey)
5. موافقة مبدئية على الرهن (في حال التمويل)
6. ترتيب تأمين المبنى قبل الإتمام
7. فهم كامل لشروط الإيجار attachment
8. مراجعة إفصاحات البائع الحصرية (خاصة للعقارات السكنية)

💼 عناصر العقد الأساسية:
✓ شروط وأحكام البيع (Terms & Conditions of Sale)
✓ نموذج معلومات الإيجار (Leasehold Information Form) - إذا كان الإيجار
✓ نماذج المعلومات العقارية TA6/TA7
✓ تقرير كفاءة الطاقة (Energy Performance Certificate - EPC) إلزامي
✓ تقرير فحص المبنى الشامل (Building Survey Report)
✓ بحث السلطات المحلية (Local Authority Search)
✓ بحث بيئي (Environmental Search)
✓ بحث التصريف والمياه (Drainage & Water Search)
✓ سجل الملكية (Title Register من Land Registry)
✓ حقوق المستأجرين المحليين (في حال شراء للإيجار)

⚠️ المخاطر القانونية وعلامات التحذير:
✗ شراء عقار إيجاري بأقل من 80 سنة متبقية
✗ شروط تصعيد الأرض (Ground rent) المتزايدة
✗ نزاعات رسوم الخدمات مع مالكي الإيجار الآخرين
✗ انجراف التربة أو عيوب هيكلية في المبنى
✗ شروط مقيدة مرهقة (Onerous restrictive covenants)
✗ عيوب في الملكية أو نزاعات حدودية
✗ عقارات مخالفة تخطيطية أو بدون تراخيص
✗ ضعف هيكلية Morse العقار بعد الامتثال
✗ ألمفات السباكة والكهرباء غير المعتمدة
✗ رهون أو فروقات ضريبية مستحقة غير مدفوعة

✅ قائمة الفحص الشاملة:
☐ تفويض محامٍ متخصص في عمليات البيع الفاصلة
☐ الحصول على تقرير فحص شامل للمبنى
☐ طلب تقارير معلومات العقار الكاملة
☐ إجراء بحث السلطات المحلية (Local Authority Search)
☐ إجراء بحث بيئي (Environmental Search)
☐ التحقق من تراخيص البناء والمعايير
☐ التحقق من حق البائع في البيع
☐ مراجعة مستندات الإيجار (إن وجدت)
☐ التحقق من الأرضي والرسوم المستحقة
☐ ترتيب تأمين المبنى قبل الإتمام
☐ التحقق من كفاءة المرافق ووظيفتها
☐ التحقق من آثار ضريبة المطبوعات
☐ مراجعة عقود الإيجار السارية (إذا استثمر للإيجار)
☐ الحصول على عرض الرهن مبدئيًا
☐ مراجعة نهائية قبل الإتمام (Walkthrough)
☐ التحقق من الشروط والقواعد المحلية
☐ التأكد من عدم وجود قيود إضافية على الاستخدام
☐ مراجعة التوقعات المستقبلية للمنطقة والاتجاهات

🛡️ الحمايات القانونية:
• سجل الملكية (ضمان حكومي مرموق)
• حمايات قانونية تشريعية للإيجار الحديث
• تطبيق قواعد البناء واللوائح
• حمايات قوانين حقوق المستهلك
• مبدأ Caveat Emptor (التحقق ضروري قبل الشراء)
• محامون متاحون وتأمينهم متوفر (Solicitor Indemnity)
• قانون وصف العقار بشكل خاطئ (Misdescription Act)

💰 اعتبارات الضرائب والمالية:
• ضريبة المطبوعات على الأراضي (Stamp Duty): 0-15% (نظام متدرج)
• ضريبة العقار السنوية: ضريبة المجلس (Council Tax) - سكني
• الأرباح الرأسمالية: 20% على الأرباح (غير مقيم رئيسي)
• دخل الإيجار: 20% ضريبة دخل + مساهمات NIC (تختلف حسب الحالة)
• فوائد الرهن العقاري: غير قابلة للخصم الضريبي حاليًا (قواعد 2025+)
• الاستثمار الأجنبي: لا قيود على إعادة تحويل الأموال
• رسوم إضافية: بحث محلي ~£250-500, فحص ~£400-1200
• رسوم المحامي: £800-£2000 حسب التعقيد
• ضريبة سمارت: 2% إضافية للممتلكات الفاخرة (>£1M)
• المرافق المجتمعية: رسوم متنوعة حسب نوع المجتمع +£1000+/سنة`,

    Singapore: `🏛️ قوانين الملكية في سنغافورة:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة بشكل عام، مع دفع ABSD (ضريبة Morton الإضافية للمشترين)
• المشترين الأجانب: 60% ABSD (اعتبارًا من 2023) بالإضافة إلى BSD القياسية
• مواطنو سنغافورة والمقيمون: ABSD أقل أو معدوم
• الملكية الحرة: متاحة لمعظم العقارات
• الإيجار: 99 سنة إيجار شائع

⚖️ المتطلبات القانونية للشراء:
1. جواز سفر ساري المفعول وتأشيرة FM3/تأشيرة للغير أجانب
2. إثبات الأموال (المراجع البنكية، الإفصاح الضريبي)
3. موافقة وزارة القانون (SingPass) — نموذجًا تلقائية
4. خيار الشراء (OTP) من البائع/المطور
5. إتمام اتفاقية الشراء والبيع (SPA)
6. فحص العقار والتقييم
7. دفع ABSD + BSD خلال 14 يوم من ممارسة الخيار

💼 عناصر العقد الأساسية:
✓ خيار الشراء (OTP) — يوقّع أولاً
✓ اتفاقية الشراء والبيع (SPA)
✓ إثبات دفع ABSD/BSD
✓ التحقق من سند الملكية (SingRegister)
✓ تأكيد clearance الضريبي للعقار
✓ إفصاح استخدام CPF (للمواطنين/المقيمين)

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء دون التحقق من تاريخ الملكية
✗ الشراء دون فهم آثار ABSD
✗ العقارات بالإيجار القريب من الانتهاء (أقل من 30 سنة)
✗ العقارات ذات الديون المستحقة (صيانة، رسوم إدارية)
✗ عدم الامتثال لإجراءات تهدئة السوق
✗ استخدام وكلاء عقاريين غير مرخصين

✅ قائمة الفحص الشاملة:
☐ التحقق من الملكية عبر SingRegister
☐ التحقق من تاريخ الصيانة والاحتياطيات العقارية
☐ تأكيد جدول دفع ABSD/BSD
☐ مراجعة الحالة المالية لمؤسسة الإدارة (MS)
☐ التحقق من وجود نزاعات قانونية قائمة
☐ التحقق من المدة المتبقية للإيجار (في حال الإيجار)
☐ الاستعانة بمحام عقاري مؤهل في سنغافورة
☐ التحقق من تسجيل الوكلاء لدى CEA
☐ التحقق من تفاصيل التطوير وحالة الإتمام
☐ الحصول على clearance ضريبي للعقار (IRAS)

🛡️ الحمايات القانونية:
• SingRegister تقدّم سجلات ملكية حاسمة
• CEA تنظم الوكلاء العقاريين المرخصين
• SLA (سلطة أراضي سنغافورة) تدير ملكية الأراضي
• إجراءات تهدئة السوق (حد أدنى 3 أشهر انتظار لإعادة البيع)
• قيود MOM/HDB تنطبق (لشقق HDB)
• ضمان المطور للمشاريع الجديدة

💰 اعتبارات الضرائب والمالية:
• ضريبة Morton المشترين (BSD): 1-4% بأسعار تصاعدية
• ضريبة Morton الإضافية للمشترين (ABSD): 60% للأجانب
• ضريبة Morton البائعين (SSD): 12% (إذا بيع خلال سنة)، 8% (1-2 سنة)، 4% (2-3 سنوات)
• ضريبة العقار: مشغول من قبل المالك (0-16%)، غير مشغول (12-32%)
• لا ضريبة أرباح رأسمالية على العقارات في سنغافورة
• دخل الإيجار خاضع للضريبة الدخل (تصاعدي)
• رسوم الإدارة الشهرية: SGD 200-800 للشقق المزدحمة
• الرسوم القانونية: SGD 2,500-5,000 نموذجي لشراء العقار`,

    Japan: `🏛️ قوانين الملكية في اليابان:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة دون قيود (لا تأشيرة ولا إقامة مطلوبة)
• مواطنو اليابان: حقوق ملكية كاملة
• الملكية الحرة: الأكثر شيوعًا — ملكية الأرض والمبنى
• الإيجار: أقل شيوعًا، رئيسيًا تجاري/طويل الأجل
• لا متطلبات حد أدنى للإقامة أو الجنسية

⚖️ المتطلبات القانونية للشراء:
1. جواز سفر ساري المفعول (لا تأشيرة مطلوبة لشراء العقار)
2. ختم شخصي (印鑑/inkan) — تقليدي أو رقمي مكافئ
3. حساب بنكي في اليابان (مستحسن للمدفوعات)
4. رقم هاتف ياباني للتواصل
5. وثيقة إذن التوقيع (إذا غائب شخصيًا)
6. فحص العقار وتفتيش من فاحص مرخص
7. تسجيل السند في دائرة الشؤون القانونية (法務局)

💼 عناصر العقد الأساسية:
✓ اتفاقية الشراء والبيع (売買契約書)
✓ بيان الشؤون المهمة (重要事項説明) — مطلوب بموجب القانون
✓ شهادة تأكيد البناء (確認書)
✓ شهادة سند الملكية (権利証)
✓ شهادة احتساب الضرائب (إن وجدت)
✓ ضريبة الختم على العقد (الطرفان)
✓ اتفاقية الوساطة مع وسيط مرخص

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء دون بيان الشؤون المهمة المناسب
✗ العقارات ذات النزاعات القانونية غير المحلولة
✗ المباني ذات مشاكل هيكلية خطيرة (التحقق من تقرير الفحص)
✗ تجديدات غير ملتزمة أو مخالفات كود البناء
✗ استئجار غير مصرح به من قبل المستأجرين الحاليين
✗ نزاعات الميراث (في حال العقار مورّث)
✗ مستندات سند مفقودة أو غير كاملة

✅ قائمة الفحص الشاملة:
☐ الحصول على فحص عقاري مرخص (インスペクション)
☐ التحقق من السند في دائرة الشؤون القانونية (法務局)
☐ مراجعة بيان الشؤون المهمة
☐ التحقق من حالة العقار ومقاومة الزلازل
☐ التحقق من تسجيل المبنى وتراخيصه
☐ التحقق من قواعد جمعية إدارة المبنى
☐ تأكيد حالة ضريبة العقار وضريبة الممتلكات الثابتة
☐ التحقق من رخصة الوكيل العقاري (宅地建物取引士)
☐ فهم قيود التخطيط العمراني للعقار
☐ الحصول على مراجعة من محام عقاري ياباني
☐ التحقق من أي حقوق سطحية أو د RESERVED (地上権・地役権)
☐ تأكيد عدم وجود مشاكل في حقوق المستأجرين الحالية

🛡️ الحمايات القانونية:
• قانون معاملات العقار (宅地建物取引法) يحمي المشترين
• بيان الشؤون المهمة إلزامي
• الوكلاء المرخصين (宅建士) ملتزمون بالمهنة،
• قانون معايير البناء (建築基準法) — السلامة/الرسوم
• المحاكم اليابانية تتعامل مع نزاعات العقارات
• تسجيل السند يقدّم إثبات ملكية قوي

💰 اعتبارات الضرائب والمالية:
• ضريبة التعديل (登録免許税): 2-4% على القيمة المقدرة
• ضريبة اكتساب العقار (不動産取得税): 3-4% على القيمة المقدرة
• ضريبة الممتلكات الثابتة (固定資産税): 1.4% سنويًا على القيمة المقدرة
• ضريبة التخطيط العمراني (都市計画税): 0.3-1.6% سنويًا (المناطق الحضرية)
• ضريبة الختم: ¥10,000-¥600,000 حسب قيمة العقد
• ضريبة الأرباح الرأسمالية: 15.315% (وطني) + 5-10% (محلي) طويل الأجل؛ 30.63% + 10% قصير الأجل (<5 سنوات)
• لا ضريبة ثروة ولا ضريبة ميراث على الملاك الأجانب (إذا غير مقيم)
• عمولة الوكيل: 3-4% + ¥60,000-¥100,000 (قياسي)`,

    Australia: `🏛️ قوانين الملكية في أستراليا:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة — موافقة FIRB (مجلس مراجعة الاستثمار الأجنبي) إلزامية
• مواطنو أستراليا والمقيمون الدائمون: حقوق ملكية كاملة
• المشترين الأجانب: يجب تقديم طلب موافقة FIRB قبل الشراء
• الملكية الحرة (تورنس title): أكثر أنواع الملكية السكنية شيوعًا
• الإيجار: شائع في المناطق الريفية/الزراعية، بعض المناطق الحضرية

⚖️ المتطلبات القانونية للشراء:
1. جواز سفر ساري المفعول وموافقة FIRB (إلزامي)
2. رقم ملف ضريبي (TFN) — لأغراض ضريبة العقار
3. حساب بنكي أسترالي (مستحسن للتسوية)
4. عقد بيع موقّع (معدّ من محام/ناقل)
5. تقارير فحص المبنى والآفات
6. فحص سند الملكية (معدّ من الناقل)
7. دفع ضريبة الختم (تختلف حسب الولاية)
8. التسوية (نقل الملكية النهائي)

💼 عناصر العقد الأساسية:
✓ عقد البيع (معدّ من محام البائع)
✓ بيان البائع / القسم 32 (وثيقة الإفصاح)
✓ تقرير فحص المبنى
✓ تقرير فحص الآفات (منفصل أو مشترك)
✓ بيان التسوية (التعديلات، الرسوم، الضرائب)
✓ إثبات دفع ضريبة الختم
✓ تسجيل نقل السند (سجل الأراضي)
✓ وثائق موافقة FIRB

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء بدون موافقة FIRB — غرم حتى 250,000 AUD + 3x الربح
✗ الشراء في المزاد دون البحث اللازم (عقد ملزم فورًا)
✗ عقارات ذات عيوب بناء غير المعلنة
✗ مناطق معرضة للفيضانات أو الحريق (قد تتطلب إفصاح)
✗ الإنفاق المفرط — لا فترة تهدئة لمشتري المزاد
✗ مشاكل ملكية/الملكية المجتمعية — قواعد OC معقدة
✗ مشاريع "عند الخط" — خطر التأخير/الإلغاء
✗ وجود مستأجر حالي — حقوق المستأجرين تأتي أولاً

✅ قائمة الفحص الشاملة:
☐ الحصول على موافقة FIRB قبل تقديم أي عرض
☐ إجراء فحص مبنى من فاحص مرخص
☐ إجراء فحص آفات (القوارض، إلخ)
☐ مراجعة بيان البائع (القسم 32) — جميع الإفصاحات
☐ التحقق من خرائط الفيضانات، مناطق الحريق، التغطيات التخطيطية
☐ التحقق من التخطيط، تراخيص التطوير، القيود
☐ مراجعة محاضر الاجتماعات وقواعد النظام (في حال شقق/منازل مزدحمة)
☐ تأكيد سند الملكية (فحص مع سجل الأراضي)
☐ التحقق من الرسوم والضرائب والمرافق المستحقة
☐ الاستعانة بمحام/ناقل أسترالي للتسوية
☐ التحقق من شروط العقد، حقوق التهدئة (إن وجدت)
☐ التحقق من مبيعات مقارنة حديثة في المنطقة
☐ تأكيد حالة المستأجر (في حال عقار مؤجر)

🛡️ الحمايات القانونية:
• موافقة FIRB إلزامية للمشترين الأجانب — مع زامَن بالغرامات
• قوانين النقل على مستوى الولاية تحكم معاملات العقار
• بيان البائع (القسم 32) إفصاح إلزامي
• قوانين الإفصاح الخاصة بالبائعين على مستوى الولاية (تختلف)
• وزارات التجارة العادلة / وكالات حماية المستهلك على مستوى الولاية
• معايير صناعة فحص المباني والتراخيص
• سجل الأراضي يقدّم سندًا لا يقاوم (نظام تورنس)

💰 اعتبارات الضرائب والمالية:
• ضريبة الختم: تختلف حسب الولاية (NSW 4-5.5%، VIC 5.5-7%، إلخ) — قد تصل 10%+ للمشترين الأجانب
• رسوم طلب FIRB: AUD 13,200+ للمباني السكنية فوق AUD 1M
• ضريبة العقار السنوية: تختلف (تختلف حسب الولاية، 0.5-2.5% من القيمة المقدرة)
• ضريبة الأراضي: ضريبة ولاية إضافية فوق العتبة
• ضريبة الأرباح الرأسمالية (CGT): خصم 50% للاحتفاظ 12+ شهر؛ تنطبق عند التصفية
• ضريبة دخل الإيجار: مفروضة كدخل (30%+ للمستثمرين الأجانب)
• لا ضريبة ميراث في أستراليا
• رسوم التحويل/القانونية: AUD 1,500-4,000 نموذجي
• فحوصات المبنى/الآفات: AUD 500-1,200 مشترك`,

    'Hong Kong': `🏛️ قوانين الملكية في هونغ كونغ:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة — هونغ كونغ لا تفرض قيودًا على الأجانب لتمتلك العقارات
• مواطنو هونغ كونغ والمقيمون الدائمون: حقوق ملكية كاملة
• الملكية الحرة: الأكثر شيوعًا — الأراضي تقنيًا بالإيجار (حكومية grants)
• الإيجار: حكومية إيجارات عادة 50/75/999 سنة (معظم grants القديمة)
• لا قيود بناءً على الجنسية أو الإقامة

⚖️ المتطلبات القانونية للشراء:
1. جواز سفر ساري المفعول (المشترين الأجانب) — لا متطلبات إقامة إضافية
2. اتفاقية الشراء والبيع (SPA) — نموذج قياسي لهونغ كونغ
3. SPA مؤقت (إن تم التفاوض قبل SPA الرسمي)
4. إتمام فحص العقار في سجل الأراضي
5. تعيين محام/ناقل (مستحسن بشدة)
6. دفع ضريبة الختم (HKAD، BSD حسب الحالة)
7. تقييم العقار (لأغراض الرهن، إن وجد)
8. اجتماع الإتمام — نقل السند

💼 عناصر العقد الأساسية:
✓ اتفاقية الشراء والبيع المؤقتة (إن وجدت)
✓ اتفاقية الشراء والبيع الرسمية (SPA)
✓ تقرير فحص السند من سجل الأراضي
✓ clearance ضريبة العقار (الرسوم وإيجار الحكومة)
✓ قواعد إدارة المبنى / عهد التنسيق المتبادل
✓ تقييم ضريبة الختم ودفعها
✓ عقد الرهن (إن تم التمويل)
✓ بيان الإتمام وإيصال الأموال

⚠️ المخاطر القانونية وعلامات التحذير:
✗ الشراء بدون فحص سند مناسب — التحقق في سجل الأراضي
✗ شراء مشاريع غير مكتملة — خطر تخلف المطور
✗ عقارات ذات دعوى أو تثبيت (فحص سجل الأراضي)
✗ أعمال بناء غير ملتزمة (هياكل/تعديلات غير مصرح بها)
✗ رسوم صيانة مستحقة أو رسوم الحكومة
✗ عقارات ذات مستأجر مشغول (حقوق المستأجرين محمية)
✗ نزاعات إدارة الملاكية (مشاكل شركة الإدارة)
✗ خطر المصادرة — قد تضطر الحكومة لشراء الأرض

✅ قائمة الفحص الشاملة:
☐ إجراء فحص سند رسمي في سجل الأراضي
☐ التحقق من الدعاوى، التثبيتات، الرهون على العقار
☐ مراجعة عهد التنسيق المتبادل (قواعد المبنى)
☐ التحقق من الحالة المالية لشركة الإدارة
☐ الحصول على أحدث ارقام Statements وإيجار الحكومة
☐ التحقق من شهادات الإتمام (في حال مبنى جديد)
☐ فحص حالة العقار thoroughly
☐ التحقق من سجل المطور (للمشاريع غير المكتملة)
☐ التحقق من عدم وجود هياكل/تعديلات غير مصرح بها
☐ الاستعانة بمحام هونغ كونغ للتحويل
☐ تأكيد مبالغ دفع ضريبة الختم
☐ التحقق من التخطيط والتقييدات العمرانية للعقار
☐ مراجعة حالة صندوق الغرق للمبنى

🛡️ الحمايات القانونية:
• سجل الأراضي يقدّم سجلات سند حاسمة
• التحويل عبر محام قياسي الممارسة
• إفصاح قانوني من البائع بعدم وجود دعوى/تثبيت
• مرسوم المباني — ينظم معايير البناء
• حماية المستأجرين — حقوق المستأجرين قبل الإخلاء
• إشراف مجلس المستهلكين للمستهلكين
• HKMA ينظم إقراض الرهن

💰 اعتبارات الضرائب والمالية:
• ضريبة الختم (HKAD): 1.5-8.5% من المبلغ (تدرج)
• ضريبة الختم للمشترين (BSD): 15% ثابت — تنطبق على المشترين الأجانب وغير المقيمين الدائمين
• ضريبة الختم للبائعين (SSD): 10% إذا بيع خلال سنة، 20% إذا خلال سنتين (اعتبارًا من 2023)
• ضريبة العقار (الرسوم): 5% من القيمة المقدرة سنويًا (تقريبًا)
• إيجار الحكومة: 3% من القيمة المقدرة (مدفوع كل 6 أشهر، أو 5.6% إذا لم ي reinvested)
• ضريبة الأرباح الرأسمالية: لا ضريبة أرباح رأسمالية في هونغ كونغ
• ضريبة التركة (ضريبة الميراث): لا ضريبة تركة منذ 2006
• عمولة الوكيل: نموذجيًا 1% كل طرف (إجمالي 2%) من سعر الشراء
• الرسوم القانونية: HKD 8,000-20,000 نموذجي للتحويل السكني`,
  }
};

// Property recommendations by budget tier
const PROPERTY_DATABASE = {
  budget: [
    { name: 'Cairo Studio', country: 'Egypt', price: 5, type: 'Buy', roi: '8%' },
    { name: 'Alexandria Apartment', country: 'Egypt', price: 8, type: 'Rent', roi: '6%' },
    { name: 'Dubai Off-Plan', country: 'UAE', price: 10, type: 'Off-Plan', roi: '12%' },
  ],
  moderate: [
    { name: 'Manhattan Penthouse', country: 'USA', price: 50, type: 'Buy', roi: '9%' },
    { name: 'London Townhouse', country: 'UK', price: 45, type: 'Buy', roi: '7%' },
    { name: 'Tokyo Hotel Suite', country: 'Japan', price: 35, type: 'Hotel', roi: '15%' },
  ],
  premium: [
    { name: 'Singapore Office Tower', country: 'Singapore', price: 200, type: 'Buy', roi: '10%' },
    { name: 'Sydney Waterfront Estate', country: 'Australia', price: 180, type: 'Buy', roi: '8%' },
    { name: 'Hong Kong Luxury Residential', country: 'Hong Kong', price: 250, type: 'Tokenized', roi: '14%' },
  ],
};

const MARKET_TRENDS = {
  en: `📊 ILLUSTRATIVE MARKET OVERVIEW (static estimates, Q1 2026 — not live data):

🌍 TOP PERFORMING MARKETS:
• Dubai: +15% YoY appreciation, strong off-plan demand
• Egypt: +12% growth, excellent entry point for new investors
• USA: Stable 6-8% appreciation, rental yields 4-6%
• London: +8% YoY recovery, post-Brexit stabilization
• Singapore: Premium market +7%, steady 10% annual returns
• Japan: +10% appreciation, strong commercial sector

💹 PROPERTY TYPE PERFORMANCE:
• Tokenized Real Estate: +25% (highest growth), starts from 1π
• Off-Plan Properties: +18%, great for long-term appreciation
• Hotel/Hospitality: +22%, strong recovery trajectory
• Residential Rentals: +11%, stable monthly cash flow
• Commercial: +8%, strategic locations only

🎯 INVESTMENT STRATEGY:
• Budget investors (under 15π): Diversify across 3-5 properties
• Moderate (15-75π): Balance growth and income streams
• Premium (75+π): Portfolio diversification across continents`,
  ar: `📊 نظرة عامة توضيحية على السوق (تقديرات ثابتة، الربع الأول 2026 — ليست بيانات حية):

🌍 أفضل الأسواق الأداء:
• دبي: +15% سنويًا، طلب قوي على المشاريع
• مصر: نمو +12%، نقطة دخول ممتازة
• الولايات المتحدة: ارتفاع مستقر 6-8%، عوائد إيجار 4-6%
• لندن: +8% سنويًا، التعافي المستقر
• سنغافورة: سوق فاخر +7%، عوائد سنوية 10%
• اليابان: +10% ارتفاع، قطاع تجاري قوي

💹 أداء أنواع العقارات:
• العقارات المرمزة: +25% (أعلى نمو)، تبدأ من 1π
• المشاريع قيد الإنشاء: +18%، رائع للارتفاع
• الفنادق/الضيافة: +22%، تعافي قوي
• الإيجار السكني: +11%، تدفق نقدي مستقر
• تجاري: +8%، مواقع استراتيجية فقط

🎯 استراتيجية الاستثمار:
• المستثمرون الناشئون: تنويع عبر 3-5 عقارات
• المتوسط: موازنة النمو والدخل
• المتقدم: التنويع عبر القارات`,
};

const PI_PAYMENTS_GUIDE = {
  en: `💳 INVESTING WITH PI NETWORK:

✅ ADVANTAGES:
• Zero fees on all transactions
• Instant global transfers 24/7
• No intermediaries or banks needed
• Blockchain-verified ownership
• Smart contracts for automation
• Fractional ownership from 1π

🔐 HOW IT WORKS:
1. Verify your Pi wallet (usually linked to your phone number)
2. Select a property investment (start from 1π)
3. Confirm transaction in Pi App
4. Receive blockchain certificate of ownership
5. Earn returns directly to your Pi wallet
6. Sell anytime or receive rental income in Pi

💰 GETTING STARTED:
• Minimum investment: 1π for tokenized properties
• Most properties: 5π - 250π range
• Monthly returns: 6-15% APY depending on property
• Withdrawal: Anytime to your personal wallet

🌟 TOKENIZED PROPERTY BENEFITS:
• Own fraction of luxury properties globally
• Automatic rent distribution in Pi
• No property management hassles
• Instant liquidity on secondary market
• Portfolio diversification made simple`,
  ar: `💳 الاستثمار مع شبكة Pi:

✅ المميزات:
• لا توجد رسوم على جميع المعاملات
• تحويلات فورية عالمية 24/7
• لا وسطاء ولا بنوك
• ملكية موثقة بالبلوكتشين
• العقود الذكية للأتمتة
• ملكية كسرية من 1π

🔐 كيفية العمل:
1. تحقق من محفظة Pi الخاصة بك
2. اختر استثمار عقاري (ابدأ من 1π)
3. أكد المعاملة في تطبيق Pi
4. استقبل شهادة ملكية بلوكتشين
5. اكسب عوائد مباشرة إلى محفظتك
6. بع في أي وقت أو اتقاض دخل إيجار بـ Pi

💰 البدء:
• الحد الأدنى: 1π للعقارات المرمزة
• معظم العقارات: نطاق 5π - 250π
• العوائد الشهرية: 6-15% APY
• السحب: في أي وقت إلى محفظتك

🌟 فوائد العقارات المرمزة:
• امتلك جزء من العقارات الفاخرة عالميًا
• توزيع إيجار تلقائي بـ Pi
• بلا متاعب إدارة الممتلكات
• سيولة فورية في السوق
• تنويع محفظة بسهولة`,
};

const GENERAL_ADVICE = {
  en: `🏠 REAL ESTATE INVESTMENT GUIDE:

✨ START YOUR JOURNEY:
• Research your preferred market (Egypt, Dubai, USA, Singapore, etc.)
• Define your budget and investment timeframe
• Choose property type: Buy, Rent, Hotel, Off-Plan, or Tokenized
• Start small and diversify across 3-5 properties
• Monitor returns and adjust portfolio annually

📈 PORTFOLIO STRATEGIES:
• Conservative: 60% stable rentals, 40% growth potential
• Balanced: 50% rentals, 50% appreciation plays
• Aggressive: 30% rentals, 70% high-growth off-plan
• Tokenized Mix: Easy entry with fractional ownership

💡 KEY SUCCESS FACTORS:
• Diversification across countries and property types
• Regular monitoring of market trends
• Reinvest returns to compound wealth
• Use Pi payments for instant global transactions
• Build long-term wealth, not quick gains

🌍 POPULAR DESTINATIONS:
• Egypt: Affordable entry, 6-12% ROI
• Dubai: Premium market, 10-15% ROI
• USA: Stable growth, 7-10% ROI
• Singapore: High value, 8-12% ROI
• London: Heritage value, 6-9% ROI`,
  ar: `🏠 دليل الاستثمار العقاري:

✨ ابدأ رحلتك:
• ابحث عن السوق المفضل لديك
• حدد ميزانيتك والإطار الزمني
• اختر نوع العقار: شراء أو إيجار أو فندق أو مشروع
• ابدأ بصغر وتنوع عبر 3-5 عقارات
• راقب العوائد وأضبط محفظتك سنويًا

📈 استراتيجيات المحفظة:
• المحافظة: 60% إيجارات مستقرة، 40% نمو
• متوازنة: 50% إيجارات، 50% تقدير
• عدوانية: 30% إيجارات، 70% نمو عالي
• المزيج المرمز: دخول سهل بملكية كسرية

💡 عوامل النجاح الرئيسية:
• التنويع عبر الدول وأنواع العقارات
• المراقبة المنتظمة لاتجاهات السوق
• إعادة استثمار العوائد
• استخدم دفعات Pi للتحويلات الفورية
• بناء ثروة طويلة الأمد

🌍 الوجهات الشهيرة:
• مصر: دخول ميسور، عائد 6-12%
• دبي: سوق فاخر، عائد 10-15%
• أمريكا: نمو مستقر، عائد 7-10%
• سنغافورة: قيمة عالية، عائد 8-12%
• لندن: قيمة تراثية، عائد 6-9%`,
};

export default function AIAdvisorChat({ language, onClose }: AIAdvisorChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userContext, setUserContext] = useState<{ username?: string; balance?: number } | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Dubai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sdk, isAuthenticated } = usePiAuth();

  // Initialize with greeting message
  useEffect(() => {
    const greeting = userContext?.username 
      ? (language !== 'ar' 
        ? `Hi ${userContext.username}! I'm Aladdin, your world-class real estate advisor on Pi Network. With your Pi balance of ${userContext.balance || 0} π, I can guide you through global property markets in UAE, Egypt, Saudi Arabia, USA, UK, Europe, and Asia. I specialize in investment strategies, ROI analysis, Golden Visa programs, off-plan risks, Pi payments, mortgages, market trends, and legal advice by country. What property insights do you need today?`
        : `مرحبا ${userContext.username}! أنا علاء الدين، مستشارك العقاري العالمي على شبكة Pi. برصيدك من ${userContext.balance || 0} π، يمكنني إرشادك عبر الأسواق العقارية العالمية في الإمارات ومصر والسعودية وأمريكا والمملكة المتحدة وأوروبا وآسيا. أتخصص في استراتيجيات الاستثمار وتحليل العوائد والتأشيرات الذهبية والمخاطر والدفع بـ Pi والرهن العقاري والاتجاهات والقوانين. ما البصائر العقارية التي تحتاجها؟`)
      : (language !== 'ar'
        ? 'Hi! I\'m Aladdin, your world-class real estate advisor. I answer ANY question about global property markets, investments, ROI, legal advice, Pi payments, mortgages, and market trends. What can I help with?'
        : 'مرحبا! أنا علاء الدين، مستشارك العقاري العالمي. أجيب على ANY سؤال عن الأسواق العقارية والاستثمارات والعوائد والقانون والدفع بـ Pi والرهن والاتجاهات. كيف يمكنني مساعدتك؟');

    setMessages([{
      role: 'assistant',
      content: greeting,
      id: 'greeting-' + Date.now(),
    }]);
  }, [userContext, language]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Extract user info from Pi SDK
  useEffect(() => {
    const extractUserInfo = async () => {
      try {
        if (isAuthenticated && sdk) {
          const authResult = await (window as any).Pi.authenticate(['payments', 'username'], () => {});
          const username = authResult?.user?.username || 'Investor';
          
          let balance = 0;
          try {
            const piBalance = await (window as any).Pi.requestReadAccess?.();
            balance = piBalance || 0;
          } catch (e) {
            console.log('[v0] Balance not available');
          }
          
          setUserContext({ username, balance });
        }
      } catch (error) {
        console.log('[v0] User info extraction skipped:', error);
        setUserContext({ username: 'Investor', balance: 0 });
      }
    };

    extractUserInfo();
  }, [isAuthenticated, sdk]);

  // Determine budget tier based on user balance
  const getBudgetTier = () => {
    const balance = userContext?.balance || 0;
    if (balance >= 50) return 'premium';
    if (balance >= 20) return 'moderate';
    return 'budget';
  };

  // Real estate keywords for detection
  const REAL_ESTATE_KEYWORDS = [
    'property', 'properties', 'invest', 'best', 'rent', 'price', 'pi',
    'market', 'roi', 'dubai', 'cairo', 'egypt', 'singapore', 'london', 'tokyo',
    'apartment', 'house', 'villa', 'office', 'hotel', 'tokenized', 'off-plan',
    'rental', 'appreciation', 'mortgage', 'financing', 'portfolio', 'diversify',
    'legal', 'law', 'contract', 'agreement', 'ownership', 'rights', 'visa', 'golden',
    'risk', 'due diligence', 'checklist', 'documentation', 'title', 'deed', 'permit',
    'freehold', 'leasehold', 'fee simple', 'encumbrance', 'lien', 'easement', 'عقار', 'عقارات', 'استثمر', 'استثمار', 'أفضل', 'شراء', 'إيجار', 'سعر', 'سوق', 'اتجاهات', 'أداء', 'عائد', 'دبي', 'القاهرة', 'مصر', 'لندن', 'سنغافورة', 'طوكيو', 'شقة', 'منزل', 'فيلا', 'مكتب', 'فندق', 'إيجاري', 'ارتقاء', 'قيمة', 'رهن', 'تمويل', 'محفظة', 'تنويع'
  ];

  // General knowledge keywords related to real estate
  const GENERAL_KEYWORDS = [
    'what', 'how', 'why', 'when', 'where', 'which', 'can', 'will', 'should',
    'tips', 'guide', 'help', 'learn', 'start', 'begin', 'different', 'better',
    'difference', 'advantage', 'disadvantage', 'benefit', 'risk', 'strategy', 'ما', 'كيف', 'ليه', 'لماذا', 'متى', 'أين', 'إيه', 'أي', 'يمكن', 'يجب', 'نصائح', 'دليل', 'مساعدة', 'تعلم', 'ابدأ', 'بدأ', 'مختلف', 'أفضل', 'فرق', 'اختلاف', 'فوق', 'عيب', 'فائدة', 'مخاطرة', 'استراتيجية'
  ];

  // Legal-specific keywords (focused on clearly legal topics only)
  const LEGAL_KEYWORDS = [
    'legal', 'law', 'laws', 'legal advice', 'legal requirements',
    'golden visa', 'investor visa', 'residency visa',
    'building permit', 'construction permit',
    'title deed', 'deed of ownership',
    'freehold', 'leasehold', 'freehold zone',
    'notary', 'notarized', 'power of attorney',
    'escrow', 'escrow account',
    'due diligence', 'checklist',
    'land registration', 'title registration',
    'compliance', 'regulation', 'regulatory',
    'closing process', 'closing costs',
    'legal dispute', 'property dispute',
    'inheritance', 'inherit property',
    'contract law', 'property law',
    'قانون', 'قوانين', 'قانوني', 'قانونية', 'إجراءات', 'إجراء', 'شروط', 'متطلبات', 'تأشيرة', 'تأشيرات', 'ذهبية', 'إقامة'
  ];

  // Check if message contains legal keywords
  const hasLegalKeywords = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return LEGAL_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  // Check if message contains real estate keywords
  const hasRealEstateKeywords = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return REAL_ESTATE_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  // Check if message contains general knowledge keywords
  const hasGeneralKeywords = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return GENERAL_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  // Generate response based on hybrid smart logic
  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const tier = getBudgetTier();
;
    const balance = userContext?.balance || 0;

    // Helper: detect country from user message (uses outer userMessage via closure)
    // Checks both English and Arabic location terms
    const detectCountry = (): string => {
      const lm = userMessage.toLowerCase();
      // Arabic country detection ( checked first since Arabic messages won't match English terms)
      if (lm.includes('مصر') || lm.includes('القاهرة') || lm.includes('الإسكندرية') || lm.includes('الجيزة') || lm.includes('نيل')) return 'Egypt';
      if (lm.includes('السعودية') || lm.includes('الملك') || lm.includes('الرياض') || lm.includes('جدة') || lm.includes('الدمام')) return 'Saudi';
      if (lm.includes('أمريكا') || lm.includes('الولايات') || lm.includes('نيويورك') || lm.includes('لوس أنجلوس') || lm.includes('مiami') || lm.includes('تكساس') || lm.includes('فلوريدا')) return 'USA';
      if (lm.includes('بريطانيا') || lm.includes('لندن') || lm.includes('إنجلترا') || lm.includes('المملكة') || lm.includes('مانشستر') || lm.includes('برمنغهام')) return 'UK';
      if (lm.includes('الإمارات') || lm.includes('دبي') || lm.includes('أبو ظبي') || lm.includes('الشارقة') || lm.includes('عجمان')) return 'UAE';
      if (lm.includes('سنغافورة')) return 'Singapore';
      if (lm.includes('اليابان') || lm.includes('طوكيو')) return 'Japan';
      if (lm.includes('أستراليا') || lm.includes('سيدني')) return 'Australia';
      if (lm.includes('هونغ كونغ') || lm.includes('hong kong')) return 'Hong Kong';
      // English country detection
      if (lm.includes('egypt') || lm.includes('cairo') || lm.includes('alexandria') || lm.includes('giza') || lm.includes('nile')) return 'Egypt';
      if (lm.includes('saudi') || lm.includes('kingdom') || lm.includes('riyadh') || lm.includes('jeddah') || lm.includes('dammam')) return 'Saudi';
      if (lm.includes('usa') || lm.includes('american') || lm.includes('united states') || lm.includes('new york') || lm.includes('los angeles') || lm.includes('miami') || lm.includes('texas') || lm.includes('florida')) return 'USA';
      if (lm.includes('uk') || lm.includes('england') || lm.includes('london') || lm.includes('britain') || lm.includes('manchester') || lm.includes('birmingham')) return 'UK';
      if (lm.includes('uae') || lm.includes('dubai') || lm.includes('abu dhabi') || lm.includes('emirates') || lm.includes('sharjah') || lm.includes('ajman')) return 'UAE';
      if (lm.includes('singapore')) return 'Singapore';
      if (lm.includes('japan') || lm.includes('tokyo')) return 'Japan';
      if (lm.includes('australia') || lm.includes('sydney')) return 'Australia';
      if (lm.includes('hong kong')) return 'Hong Kong';
      return 'UAE';
    };

    // Supported countries for our knowledge base (legal + market + properties)
    const SUPPORTED_COUNTRIES = ['Egypt', 'Saudi', 'USA', 'UK', 'UAE', 'Singapore', 'Japan', 'Australia', 'Hong Kong'];
    const isSupportedCountry = (country: string): boolean => SUPPORTED_COUNTRIES.includes(country);

    // Check if the default 'UAE' is a real match or just a fallback
    // When detectCountry returns 'UAE' as default (no country detected), but the message
    // doesn't contain any UAE-related terms, it likely refers to an unsupported location
    const DEFAULT_UAE = 'UAE';
    const isRealUaeQuery = (): boolean => {
      const lm = userMessage.toLowerCase();
      return lm.includes('uae') || lm.includes('dubai') || lm.includes('abu dhabi') ||
        lm.includes('emirates') || lm.includes('الإمارات') || lm.includes('دبي') ||
        lm.includes('أبو ظبي') || lm.includes('الشارقة') || lm.includes('ajman');
    };
    const isDefaultFallbackUae = (): boolean => detectCountry() === DEFAULT_UAE && !isRealUaeQuery();

    // Helper: build contextual follow-up suggestions based on intent
    const buildFollowUp = (intent: string, country: string): string => {
      const followUps: Record<string, string> = {
        legal: language !== 'ar'
          ? "\n\n💬 You might also want to ask:\n• \"What are the tax implications in ${country}?\"\n• \"How do I verify a property title in ${country}?\"\n• \"What documents do I need for ${country} property purchase?\""
          : "\n\n💬 قد توسّع سؤالك:\n• \"ما الآثار الضريبية في ${country}؟\"\n• \"كيف أتحقّق من سند ملكية في ${country}؟\"\n• \"ما المستندات المطلوبة لشراء عقار في ${country}؟\"",
        property: language !== 'ar'
          ? "\n\n💬 Consider exploring:\n• \"Show me ${country} properties in my budget tier\"\n• \"What is the ROI trend for ${country} real estate?\"\n• \"How does Pi payment work for ${country} properties?\""
          : "\n\n💬 قد تفضّل استكشاف:\n• \"أرني عقارات ${country} ضمن مثالي المالي\"\n• \"ما اتجاه عائد الاستثمار لعقارات ${country}؟\"\n• \"كيف يعمل دفع Pi لعقارات ${country}؟\"",
        market: language !== 'ar'
          ? "\n\n💬 You might also ask:\n• \"Which property type performs best in ${country}?\"\n• \"What is the entry price for ${country} real estate?\"\n• \"How do I get started investing in ${country}?\""
          : "\n\n💬 قد توسّع سؤالك:\n• \"أي نوع عقار الأداء الأفضل في ${country}؟\"\n• \"ما سعر الدخول للعقارات في ${country}؟\"\n• \"كيف أبدأ الاستثمار في ${country}؟\"",
        default: language !== 'ar'
          ? "\n\n💬 You can also ask about:\n• Specific country laws and regulations\n• Pi Network payment advantages\n• Golden Visa programs\n• Mortgage and financing options\n• Market comparisons between cities"
          : "\n\n💬 يمكنك أيضًا السؤال عن:\n• القوانين واللوائح حسب الدول\n• مميزات دفع Pi Network\n• برامج التأشيرات الذهبية\n• خيارات الرهن العقاري والتمويل\n• مقارنات السوق بين المدن",
      };
      return followUps[intent] || followUps.default;
    };
    // LEGAL QUESTIONS (Priority 1) — use helper functions from closure
    if (hasLegalKeywords(userMessage)) {
      const country = detectCountry();
      // Route to Claude if country is not supported (default UAE or unsupported)
      if (!isSupportedCountry(country) || isDefaultFallbackUae()) return null;
      const legalLang = (language !== 'ar' ? 'en' : 'ar') as 'en' | 'ar';
      const legalInfo = LEGAL_FRAMEWORK[legalLang][country as keyof typeof LEGAL_FRAMEWORK[typeof legalLang]];
      const disclaimer = language !== 'ar'
        ? '\n\n⚠️ LEGAL DISCLAIMER: This is general legal guidance only. It is not a substitute for professional legal advice. Always consult a licensed lawyer in your jurisdiction before making any real estate decisions or signing contracts.'
        : '\n\n⚠️ تنويه قانوني: هذا إرشاد قانوني عام فقط. إنه ليس بديلاً عن المشورة القانونية المتخصصة. استشر دائماً محامياً مرخصاً في نطاقك القضائي قبل اتخاذ أي قرار عقاري أو توقيع عقود.';
      return legalInfo + disclaimer + buildFollowUp('legal', country);
    }

    // LOGIC 1: Real Estate Keywords - Use existing property data
    if (hasRealEstateKeywords(userMessage)) {
      // Pi payment keywords (broadened detection)
      if (lowerMessage.includes('pi') && (lowerMessage.includes('pay') || lowerMessage.includes('transaction') || lowerMessage.includes('wallet') || lowerMessage.includes('invest') || lowerMessage.includes('payment') || lowerMessage.includes('transfer') || lowerMessage.includes('how') || lowerMessage.includes('work') || lowerMessage.includes('use') || lowerMessage.includes('advantage') || lowerMessage.includes('benefit') || lowerMessage.includes('start') || lowerMessage.includes('minimum') || lowerMessage.includes('دفع') || lowerMessage.includes('شراء') || lowerMessage.includes('معاملة') || lowerMessage.includes('محفظة') || lowerMessage.includes('استثمر') || lowerMessage.includes('استثمار') || lowerMessage.includes('تحويل') || lowerMessage.includes('كيف') || lowerMessage.includes('يعمل') || lowerMessage.includes('مميزات') || lowerMessage.includes('فائدة') || lowerMessage.includes('ابدأ') || lowerMessage.includes('أدنى') || lowerMessage.includes('الحد'))) {

        return PI_PAYMENTS_GUIDE[language === 'ar' ? 'ar' : 'en'] + (language !== 'ar' ? "\n\n💬 Want to know more? Ask about specific Pi payment scenarios." : "\n\n💬 تريد معرفة المزيد؟ اسأل عن سيناريوهات دفع Pi المحددة.");
      }

      // City comparison (Dubai vs Cairo, etc) — enhanced with strategic advice
      // Comparison: only when user explicitly compares, or mentions 2+ cities
      const hasComparisonWord = lowerMessage.includes('vs') || lowerMessage.includes('compare') || lowerMessage.includes('versus') ||
        lowerMessage.includes('أفضل بين') || lowerMessage.includes('أيهما') || lowerMessage.includes('مقارنة') || lowerMessage.includes('قارن');
      const hasDubai = lowerMessage.includes('dubai') || lowerMessage.includes('دبي') || lowerMessage.includes('uae') || lowerMessage.includes('الإمارات');
      const hasCairo = lowerMessage.includes('cairo') || lowerMessage.includes('القاهرة') || lowerMessage.includes('egypt') || lowerMessage.includes('مصر');
      const hasLondon = lowerMessage.includes('london') || lowerMessage.includes('لندن') || lowerMessage.includes('uk') || lowerMessage.includes('britain');
      const hasSingapore = lowerMessage.includes('singapore') || lowerMessage.includes('سنغافورة');
      const hasTokyo = lowerMessage.includes('tokyo') || lowerMessage.includes('طوكيو') || lowerMessage.includes('japan') || lowerMessage.includes('اليابان');
      const cityCount = [hasDubai, hasCairo, hasLondon, hasSingapore, hasTokyo].filter(Boolean).length;
      const isComparison = hasComparisonWord || cityCount >= 2;
      if (isComparison) {
        const comparison = language !== 'ar'
          ? `🏙️ DUBAI VS CAIRO COMPARISON:\n\nDUBAI:\n• Price Range: 10-250π\n• Expected ROI: 10-15% annually\n• Property Types: Luxury, Off-Plan, Hotels\n• Market Growth: +15% YoY\n• Best For: Premium investors seeking high returns\n\nCAIRO:\n• Price Range: 3-20π\n• Expected ROI: 6-12% annually\n• Property Types: Residential, Apartments, Studios\n• Market Growth: +12% YoY\n• Best For: New investors starting their portfolio\n\n💡 RECOMMENDATION:\n• Start in Cairo if new (lower entry point)\n• Diversify between both cities for balanced growth\n• Dubai for premium properties, Cairo for value`
          : `🏙️ مقارنة دبي والقاهرة:\n\nدبي:\n• نطاق الأسعار: 10-250π\n• العائد المتوقع: 10-15% سنويًا\n• أنواع العقارات: فاخرة، مشاريع، فنادق\n• نمو السوق: +15% سنويًا\n• الأفضل للـ: المستثمرين المتقدمين\n\nالقاهرة:\n• نطاق الأسعار: 3-20π\n• العائد المتوقع: 6-12% سنويًا\n• أنواع العقارات: سكنية، شقق، استوديوهات\n• نمو السوق: +12% سنويًا\n• الأفضل للـ: المستثمرين الجدد\n\n💡 التوصية:\n• ابدأ بالقاهرة إذا كنت جديدًا\n• تنوع بين كلا المدينتين\n• دبي للعقارات الفاخرة`;
        return comparison;
      }
      // Market / trends / price / ROI (with country focus + follow-up)
      if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('price') || lowerMessage.includes('roi') || lowerMessage.includes('growth') || lowerMessage.includes('performance') || lowerMessage.includes('appreciation') || lowerMessage.includes('سوق') || lowerMessage.includes('اتجاهات') || lowerMessage.includes('أداء') || lowerMessage.includes('عائد') || lowerMessage.includes('سعر') || lowerMessage.includes('قيمة')) {
        const country = detectCountry();
        // Only serve market insights for supported countries; otherwise route to Claude
        if (!isSupportedCountry(country) || isDefaultFallbackUae()) return null;
        const marketIntro = language !== 'ar'
          ? `📊 MARKET INSIGHTS — Focus: ${country}\n\n`
          : `📊 رؤى السوق — التركيز: ${country}\n\n`;
        return marketIntro + MARKET_TRENDS[language === 'ar' ? 'ar' : 'en'] + buildFollowUp('market', country);
      }

      // Property recommendation: explicit intent to get property suggestions
      // Covers English + Arabic: best/أفضل, recommend/أنصح, top/أعلى, portfolio,
      // "which property/specific", and "أين/فين" + invest/property context
      const isPropertyAsk = (lowerMessage.includes('best') || lowerMessage.includes('أفضل') ||
        lowerMessage.includes('recommend') || lowerMessage.includes('أنصح') || lowerMessage.includes('أوصي') ||
        lowerMessage.includes('top') || lowerMessage.includes('أعلى') ||
        lowerMessage.includes('portfolio') ||
        (lowerMessage.includes('which') && (lowerMessage.includes('property') || lowerMessage.includes('properties') || lowerMessage.includes('invest') || lowerMessage.includes('specific')))) ||
        ((lowerMessage.includes('أين') || lowerMessage.includes('فين')) &&
         (lowerMessage.includes('invest') || lowerMessage.includes('استثمر') || lowerMessage.includes('استثمار') ||
          lowerMessage.includes('property') || lowerMessage.includes('عقار') || lowerMessage.includes('عقارات'))) ||
        ((lowerMessage.includes('property') || lowerMessage.includes('عقار') || lowerMessage.includes('عقارات')) &&
         (lowerMessage.includes('best') || lowerMessage.includes('أفضل') ||
          lowerMessage.includes('recommend') || lowerMessage.includes('أنصح') ||
          lowerMessage.includes('top') || lowerMessage.includes('أعلى') ||
          lowerMessage.includes('where') || lowerMessage.includes('أين') ||
          (lowerMessage.includes('which') && lowerMessage.includes('property'))));
      if (isPropertyAsk) {
        const properties = PROPERTY_DATABASE[tier as keyof typeof PROPERTY_DATABASE];
        const topThree = properties.slice(0, 3);
        const balance = userContext?.balance || 0;
        const country = detectCountry();
        // Only serve property recommendations for supported countries; otherwise route to Claude
        if (!isSupportedCountry(country) || isDefaultFallbackUae()) return null;

        const response = language !== 'ar'
          ? `🏆 TOP RECOMMENDED PROPERTIES FOR YOUR PORTFOLIO:\n\n${topThree.map((p, i) => `${i + 1}. ${p.name}\n   📍 ${p.country} | 💰 ${p.price}π | 🏠 ${p.type} | 📈 ROI: ${p.roi}`).join('\n\n')}\n\nThese properties are matched to your Pi balance of ${balance}π. ${balance < 10 ? 'I recommend starting with the most accessible option and building your portfolio gradually.' : balance >= 50 ? 'With your balance level, you can diversify across multiple properties for optimal returns.' : 'Start with one property and expand your portfolio over time.'}\n${buildFollowUp('property', country)}`
          : `🏆 أفضل العقارات الموصى بها لمحفظتك:\n\n${topThree.map((p, i) => `${i + 1}. ${p.name}\n   📍 ${p.country} | 💰 ${p.price}π | 🏠 ${p.type} | 📈 العائد: ${p.roi}`).join('\n\n')}\n\n${balance < 10 ? 'أنصحك بالبدء بالخيار الأبسط وبناء محفظتك تدريجيًا.' : balance >= 50 ? 'برصيدك، يمكنك التنويع عبر عقارات متعددة لتحقيق أفضل عائد.' : 'ابدأ بعقار واحد وطور محفظتك مع الوقت.'}\n${buildFollowUp('property', country)}`;
        return response;
      }
    }

    // After real estate keywords block: if no sub-condition matched, check if we should
    // still use GENERAL_ADVICE or route to Claude (for unsupported countries)
    const detectedCountry = detectCountry();
    const countryIsSupported = isSupportedCountry(detectedCountry);

    if (hasGeneralKeywords(userMessage)) {
      // Only serve general advice for supported countries; otherwise route to Claude
      if (!countryIsSupported || isDefaultFallbackUae()) return null;
      return GENERAL_ADVICE[language === 'ar' ? 'ar' : 'en'] + buildFollowUp('default', 'Global');
    }

    // LOGIC 3: Any other question - Send to Claude API
    return null; // Signal to use Claude API
  };

  // Handle voice playback
  const handlePlayVoice = (messageId: string, content: string) => {
    if (playingMessageId === messageId) {
      // Stop current playback
      stopSpeech();
      setPlayingMessageId(null);
    } else {
      // Stop any existing playback
      if (playingMessageId) {
        stopSpeech();
      }
      
      // Start new playback
      setPlayingMessageId(messageId);
      speakMessage(content, language === 'ar' ? 'ar' : 'en', () => {
        setPlayingMessageId(null);
      });
    }
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      id: 'user-' + Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate 1.5 second typing delay
    setTimeout(async () => {
      const response = generateResponse(text);
      
      // If response is null, use Claude API
      if (response === null) {
        try {
          const apiResponse = await fetch('/api/claude-advisor', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              message: text,
              language: language,
            }),
          });

          const data = await apiResponse.json();
          
          if (data.success) {
            const assistantMessage: Message = {
              role: 'assistant',
              content: data.response,
              id: 'assistant-' + Date.now(),
              poweredByAI: true,
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } else {
            // If Claude fails, still show an error message but not a refusal
            const errorMessage: Message = {
              role: 'assistant',
              content: language !== 'ar'
                ? 'I encountered an issue processing your question. Please try again.'
                : 'واجهت مشكلة في معالجة سؤالك. يرجى المحاولة مرة أخرى.',
              id: 'assistant-' + Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        } catch (error) {
          console.error('[v0] Claude API call failed:', error);
          // Still show a helpful message, not a refusal
          const errorMessage: Message = {
            role: 'assistant',
            content: language !== 'ar'
              ? 'I encountered an issue processing your question. Please try again.'
              : 'واجهت مشكلة في معالجة سؤالك. يرجى المحاولة مرة أخرى.',
            id: 'assistant-' + Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
        setIsLoading(false);
      } else {
        // Use local response
        const assistantMessage: Message = {
          role: 'assistant',
          content: response,
          id: 'assistant-' + Date.now(),
          poweredByAI: false,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;

        // Add user message with photo
        const userMessage: Message = {
          role: 'user',
          content: language !== 'ar' ? '📸 Analyzing property photo...' : '📸 جاري تحليل صورة العقار...',
          id: 'user-photo-' + Date.now(),
          photoUrl: imageData,
        };

        setMessages((prev) => [...prev, userMessage]);

        // Call API for analysis
        try {
          const response = await fetch('/api/analyze-property-photo', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              imageData,
              city: selectedCity,
              language,
            }),
          });

          const data = await response.json();

          if (data.success && data.analysis) {
            // Add analysis message
            const analysisMessage: Message = {
              role: 'assistant',
              content: language !== 'ar' 
                ? `✅ Property analysis complete! I've detected a ${data.analysis.roomType} in ${selectedCity}. The property appears to be in ${data.analysis.condition.toLowerCase()} condition with excellent investment potential.`
                : `✅ اكتمل تحليل العقار! اكتشفت ${data.analysis.roomType} في ${selectedCity}. يبدو أن العقار في حالة ${data.analysis.condition} مع إمكانات استثمار ممتازة.`,
              id: 'assistant-analysis-' + Date.now(),
              photoAnalysis: data.analysis,
            };

            setMessages((prev) => [...prev, analysisMessage]);
          } else {
            throw new Error('Analysis failed');
          }
        } catch (error) {
          console.error('[v0] Photo analysis error:', error);
          const errorMessage: Message = {
            role: 'assistant',
            content: language !== 'ar' 
              ? 'I encountered an issue analyzing the photo. Please ensure it shows a clear property view and try again.'
              : 'واجهت مشكلة في تحليل الصورة. يرجى التأكد من أن الصورة تعرض منظر عقار واضح والمحاولة مرة أخرى.',
            id: 'assistant-error-' + Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      };

      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
      {/* Chat Container */}
      <div className="w-full h-screen md:h-[90vh] md:max-w-2xl md:mx-auto md:rounded-t-2xl bg-gradient-to-b from-[#1a1410] to-[#0f0b08] border-t border-[#F59E0B]/30 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#2a1f15] border-b border-[#F59E0B]/30 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {language !== 'ar'
                  ? 'Aladdin AI'
                  : 'علاء الدين'}
              </h2>
              <p className="text-xs text-gray-400">
                {language !== 'ar' ? 'World-Class Real Estate Advisor' : 'مستشار عقاري عالمي'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 hover:bg-[#F59E0B]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#F59E0B]" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {/* Photo Preview for user photos */}
              {message.photoUrl && (
                <div className="flex justify-end">
                  <div className="max-w-xs md:max-w-md">
                    <img 
                      src={message.photoUrl} 
                      alt="Property photo" 
                      className="w-full rounded-lg border border-[#F59E0B]/50 shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Photo Analysis Card */}
              {message.photoAnalysis && (
                <div className="flex justify-start">
                  <div className="max-w-lg w-full">
                    <PropertyPhotoAnalysisCard 
                      analysis={message.photoAnalysis}
                      language={language as 'en' | 'ar'}
                      onInvest={() => {
                        const cityInvest = language !== 'ar'
                          ? `I want to invest in the ${message.photoAnalysis.roomType} in ${selectedCity}. Can you guide me through the process?`
                          : `أريد الاستثمار في ${message.photoAnalysis.roomType} في ${selectedCity}. هل يمكنك إرشادي من خلال العملية؟`;
                        handleSendMessage(cityInvest);
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#F59E0B] text-black'
                      : 'bg-[#2a1f15] border border-[#F59E0B]/30 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Voice button for assistant messages */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handlePlayVoice(message.id, message.content)}
                      className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] transition-colors"
                      title={language !== 'ar' ? 'Listen to response' : 'استمع للإجابة'}
                    >
                      {playingMessageId === message.id ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>{language !== 'ar' ? 'Stop' : 'إيقاف'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>{language !== 'ar' ? 'Listen' : 'استمع'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {message.poweredByAI && (
                <div className="flex justify-start mt-2">
                  <span className="text-xs text-[#F59E0B] bg-[#2a1f15]/50 px-2 py-1 rounded">
                    🤖 Powered by AI
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#2a1f15] border border-[#F59E0B]/30 text-gray-100 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions - Show only initially */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-8 space-y-2">
              <p className="text-xs text-gray-400 px-2">
                {language !== 'ar'
                  ? 'Suggested questions:'
                  : 'الأسئلة المقترحة:'}
              </p>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS[language === 'ar' ? 'ar' : 'en'].map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-[#2a1f15] border border-[#F59E0B]/30 rounded-lg hover:bg-[#3a2f25] hover:border-[#F59E0B]/50 transition-colors disabled:opacity-50 text-sm text-gray-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#F59E0B]/30 bg-[#1a1410] p-4 space-y-3">
          {/* City Selector for Photo Analysis */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-gray-400">
              {language !== 'ar' ? 'Analyze for:' : 'تحليل ل:'}
            </span>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs bg-[#2a1f15] border border-[#F59E0B]/30 text-white rounded px-2 py-1 focus:outline-none focus:border-[#F59E0B]"
            >
              <option>Dubai</option>
              <option>Abu Dhabi</option>
              <option>Cairo</option>
              <option>New York</option>
              <option>London</option>
              <option>Singapore</option>
            </select>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language !== 'ar'
                  ? 'Ask about properties, trends, or Pi payments...'
                  : 'اسأل عن العقارات والاتجاهات أو دفعات Pi...'
              }
              disabled={isLoading || uploadingPhoto}
              className="flex-1 bg-[#2a1f15] border border-[#F59E0B]/30 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] disabled:opacity-50"
            />

            {/* Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || uploadingPhoto}
              title={language !== 'ar' ? 'Upload property photo for AI analysis' : 'تحميل صورة عقار للتحليل'}
              className="px-3 py-3 bg-[#2a1f15] border border-[#F59E0B]/30 hover:border-[#F59E0B]/60 text-[#F59E0B] rounded-lg transition-all disabled:opacity-50 flex items-center justify-center hover:bg-[#3a2f25]"
            >
              {uploadingPhoto ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhoto}
            />

            <button
              type="submit"
              disabled={isLoading || uploadingPhoto || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-[#F59E0B] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-2 text-[10px] leading-snug text-gray-500 text-center">
            {language !== 'ar'
              ? 'General information only, not financial or legal advice. Figures are illustrative estimates, not live data.'
              : 'معلومات عامة فقط وليست نصيحة مالية أو قانونية. الأرقام تقديرية توضيحية وليست بيانات حية.'}
          </p>
        </div>
      </div>
    </div>
  );
}
