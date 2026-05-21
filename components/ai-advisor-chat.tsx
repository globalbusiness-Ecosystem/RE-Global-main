'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader, Volume2, VolumeX, Camera, Upload } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import PropertyPhotoAnalysisCard from '@/components/property-photo-analysis-card';

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
  language?: 'en' | 'ar';
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
const speakMessage = (text: string, language: 'en' | 'ar' = 'en', onComplete?: () => void) => {
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
  },
  ar: {
    UAE: `🏛️ قوانين الملكية في الإمارات:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة في مناطق محددة (دبي مارينا، دبي للأعمال)
• التسجيل: إجباري من قبل دائرة الأراضي والأملاك
• الإيجار: حتى 99 سنة في مناطق معينة
• الملكية الكاملة: متاحة في مناطق حرة محددة

⚖️ المتطلبات القانونية:
1. جواز سفر صحيح وتأشيرة إقامة
2. وكالة (إذا لم تكن حاضراً شخصياً)
3. شهادة رهن عقاري (عند الحاجة)
4. فحص عقاري معتمد
5. خلو الملكية من التكاليف

💼 عناصر العقد الأساسية:
✓ عقد البيع والشراء
✓ شهادة عدم الممانعة
✓ شهادة إكمال المبنى
✓ حساب الضمان
✓ وثيقة ملكية واضحة

⚠️ المخاطر القانونية:
✗ الشراء خارج منطقة حرة بدون إيجار
✗ الدفع قبل التسجيل
✗ فقدان شهادة عدم الممانعة
✗ نقص الوثائق

✅ قائمة الفحص الشاملة:
☐ التحقق من الملكية في دائرة الأراضي
☐ فحص شهادة الإكمال
☐ التحقق من فواتير المرافق
☐ مراجعة الخطة الرئيسية`,

    Egypt: `🏛️ قوانين الملكية في مصر:

📋 حقوق الملكية:
• ملكية الأجانب: محدودة (مناطق معينة مسموحة)
• المواطنون المصريون: حقوق ملكية كاملة
• الإيجار: حتى 50 سنة قابلة للتجديد
• العاصمة الإدارية: مناطق خاصة للمستثمرين الأجانب

⚖️ المتطلبات القانونية:
1. موافقة هيئة تنمية الاستثمار
2. جواز سفر صحيح وشهادة حالة مدنية
3. تصديق سفارة على المستندات
4. فحص عقاري معتمد

💼 عناصر العقد الأساسية:
✓ وكالة باللغة العربية
✓ فحص سند الملكية
✓ خلو من النزاعات
✓ شهادة الإشغال

⚠️ المخاطر القانونية:
✗ الشراء بدون موافقة الاستثمار
✗ عدم التسجيل الرسمي
✗ فقدان السندات الأصلية

✅ قائمة الفحص الشاملة:
☐ الحصول على موافقة الاستثمار
☐ التحقق من سند الملكية`,

    Saudi: `🏛️ قوانين الملكية في السعودية:

📋 حقوق الملكية:
• ملكية الأجانب: محدودة في مناطق تجارية
• المواطنون السعوديون: ملكية غير محدودة
• الإيجار: حتى 50 سنة قابلة للتجديد

⚖️ المتطلبات القانونية:
1. تأشيرة أو رخصة عمل
2. جواز سفر صحيح
3. موافقة وزارة الإسكان

💼 عناصر العقد الأساسية:
✓ عقد بيع متوافق مع الشريعة
✓ تسجيل العقار
✓ سند ملكية واضح

⚠️ المخاطر القانونية:
✗ الشراء بدون موافقة وزارية
✗ فقدان رخص البناء

✅ قائمة الفحص الشاملة:
☐ الحصول على موافقة وزاري
☐ التحقق من التسجيل الرسمي`,

    USA: `🏛️ قوانين الملكية في الولايات المتحدة:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة عموماً (تختلف حسب الولاية)
• الملكية الكاملة: معيار المنازل السكنية
• FIRPTA: قانون الضريبة على الاستثمار الأجنبي

⚖️ المتطلبات القانونية:
1. جواز سفر صحيح ورقم دافع ضرائب
2. حساب بنكي أمريكي
3. إثبات الأموال أو موافقة رهن

💼 عناصر العقد الأساسية:
✓ اتفاقية الشراء والبيع
✓ وثيقة تأمين الملكية
✓ تقرير الفحص الشامل

⚠️ المخاطر القانونية:
✗ الشراء في مناطق الفيضانات
✗ عيوب الملكية
✗ نقص التصاريح

✅ قائمة الفحص الشاملة:
☐ الحصول على تأمين الملكية
☐ فحص شامل للمنزل
☐ التحقق من الضرائب`,

    UK: `🏛️ قوانين الملكية في المملكة المتحدة:

📋 حقوق الملكية:
• ملكية الأجانب: مسموحة بالكامل
• الملكية الكاملة: ملكية دائمة
• الإيجار: ملكية محدودة الأجل (عادة 99+ سنة)

⚖️ المتطلبات القانونية:
1. جواز سفر صحيح
2. إثبات الأموال
3. توكيل محام متخصص

💼 عناصر العقد الأساسية:
✓ شروط البيع والشراء
✓ تقرير الفحص الشامل
✓ شهادة كفاءة الطاقة

⚠️ المخاطر القانونية:
✗ شراء إيجار بأقل من 80 سنة
✗ عيوب البناء
✗ نزاعات الحدود

✅ قائمة الفحص الشاملة:
☐ توكيل محام متخصص
☐ فحص شامل للمبنى
☐ التحقق من الملكية`,
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
  en: `📊 CURRENT MARKET TRENDS (Q1 2026):

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
  ar: `📊 اتجاهات السوق الحالية (Q1 2026):

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
      ? (language === 'en' 
        ? `Hi ${userContext.username}! I'm Aladdin, your world-class real estate advisor on Pi Network. With your Pi balance of ${userContext.balance || 0} π, I can guide you through global property markets in UAE, Egypt, Saudi Arabia, USA, UK, Europe, and Asia. I specialize in investment strategies, ROI analysis, Golden Visa programs, off-plan risks, Pi payments, mortgages, market trends, and legal advice by country. What property insights do you need today?`
        : `مرحبا ${userContext.username}! أنا علاء الدين، مستشارك العقاري العالمي على شبكة Pi. برصيدك من ${userContext.balance || 0} π، يمكنني إرشادك عبر الأسواق العقارية العالمية في الإمارات ومصر والسعودية وأمريكا والمملكة المتحدة وأوروبا وآسيا. أتخصص في استراتيجيات الاستثمار وتحليل العوائد والتأشيرات الذهبية والمخاطر والدفع بـ Pi والرهن العقاري والاتجاهات والقوانين. ما البصائر العقارية التي تحتاجها؟`)
      : (language === 'en'
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
    'property', 'properties', 'invest', 'best', 'buy', 'rent', 'price', 'pi', 
    'market', 'roi', 'dubai', 'cairo', 'egypt', 'singapore', 'london', 'tokyo',
    'apartment', 'house', 'villa', 'office', 'hotel', 'tokenized', 'off-plan',
    'rental', 'appreciation', 'mortgage', 'financing', 'portfolio', 'diversify',
    'legal', 'law', 'contract', 'agreement', 'ownership', 'rights', 'visa', 'golden',
    'risk', 'due diligence', 'checklist', 'documentation', 'title', 'deed', 'permit',
    'freehold', 'leasehold', 'fee simple', 'encumbrance', 'lien', 'easement'
  ];

  // General knowledge keywords related to real estate
  const GENERAL_KEYWORDS = [
    'what', 'how', 'why', 'when', 'where', 'which', 'can', 'will', 'should',
    'tips', 'guide', 'help', 'learn', 'start', 'begin', 'different', 'better',
    'difference', 'advantage', 'disadvantage', 'benefit', 'risk', 'strategy'
  ];

  // Legal-specific keywords
  const LEGAL_KEYWORDS = [
    'legal', 'law', 'laws', 'contract', 'agreement', 'ownership', 'rights', 'visa',
    'golden visa', 'permit', 'license', 'documentation', 'title', 'deed', 'transfer',
    'registration', 'freehold', 'leasehold', 'due diligence', 'checklist', 'risk',
    'risks', 'compliance', 'regulation', 'tax', 'fees', 'protection', 'dispute',
    'closing', 'escrow', 'notary', 'notarized', 'authorization', 'power of attorney',
    'uae', 'egypt', 'saudi', 'america', 'uk', 'usa', 'england'
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

    // LEGAL QUESTIONS - Priority 1
    if (hasLegalKeywords(userMessage)) {
      // Detect country for legal framework
      let country = 'UAE';
      if (lowerMessage.includes('egypt') || lowerMessage.includes('cairo')) country = 'Egypt';
      else if (lowerMessage.includes('saudi') || lowerMessage.includes('kingdom')) country = 'Saudi';
      else if (lowerMessage.includes('usa') || lowerMessage.includes('american') || lowerMessage.includes('states')) country = 'USA';
      else if (lowerMessage.includes('uk') || lowerMessage.includes('england') || lowerMessage.includes('london') || lowerMessage.includes('britain')) country = 'UK';
      else if (lowerMessage.includes('uae') || lowerMessage.includes('dubai') || lowerMessage.includes('emirates')) country = 'UAE';

      const legalInfo = LEGAL_FRAMEWORK[language][country as keyof typeof LEGAL_FRAMEWORK[typeof language]];
      const disclaimer = language === 'en'
        ? '\n\n⚠️ LEGAL DISCLAIMER: This is general legal guidance only. It is not a substitute for professional legal advice. Always consult a licensed lawyer in your jurisdiction before making any real estate decisions or signing contracts.'
        : '\n\n⚠️ تنويه قانوني: هذا إرشاد قانوني عام فقط. إنه ليس بديلاً عن المشورة القانونية المتخصصة. استشر دائماً محامياً مرخصاً في نطاقك القضائي قبل اتخاذ أي قرار عقاري أو توقيع عقود.';
      
      return legalInfo + disclaimer;
    }

    // LOGIC 1: Real Estate Keywords - Use existing property data
    if (hasRealEstateKeywords(userMessage)) {
      // Property/investment keywords
      if (lowerMessage.includes('invest') || lowerMessage.includes('best') || lowerMessage.includes('property') || lowerMessage.includes('properties')) {
        const properties = PROPERTY_DATABASE[tier as keyof typeof PROPERTY_DATABASE];
        const topThree = properties.slice(0, 3);
        
        const response = language === 'en'
          ? `🏆 TOP 3 PROPERTIES FOR YOU:\n\n${topThree.map((p, i) => `${i + 1}. ${p.name}\n   📍 ${p.country} | 💰 ${p.price}π | 🏠 ${p.type} | 📈 ROI: ${p.roi}`).join('\n\n')}\n\nThese properties are perfectly sized for your Pi balance of ${userContext?.balance || 0} π. Each offers strong returns and diversification. Start with one and build your portfolio!`
          : `🏆 أفضل 3 عقارات لك:\n\n${topThree.map((p, i) => `${i + 1}. ${p.name}\n   📍 ${p.country} | 💰 ${p.price}π | 🏠 ${p.type} | 📈 العائد: ${p.roi}`).join('\n\n')}\n\nهذه العقارات مناسبة تمامًا لرصيدك من ${userContext?.balance || 0} π. تقدم كل منها عوائد قوية وتنويعًا. ابدأ بواحدة وبني محفظتك!`;

        return response;
      }

      // Market/trends keywords
      if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('price') || lowerMessage.includes('roi')) {
        return MARKET_TRENDS[language];
      }

      // Pi payment keywords
      if (lowerMessage.includes('pi') && (lowerMessage.includes('pay') || lowerMessage.includes('buy') || lowerMessage.includes('transaction') || lowerMessage.includes('wallet') || lowerMessage.includes('invest'))) {
        return PI_PAYMENTS_GUIDE[language];
      }

      // City comparison (Dubai vs Cairo, etc)
      if ((lowerMessage.includes('dubai') || lowerMessage.includes('cairo') || lowerMessage.includes('compare')) && lowerMessage.includes('vs')) {
        const comparison = language === 'en'
          ? `🏙️ DUBAI VS CAIRO COMPARISON:\n\nDUBAI:\n• Price Range: 10-250π\n• Expected ROI: 10-15% annually\n• Property Types: Luxury, Off-Plan, Hotels\n• Market Growth: +15% YoY\n• Best For: Premium investors seeking high returns\n\nCAIRO:\n• Price Range: 3-20π\n• Expected ROI: 6-12% annually\n• Property Types: Residential, Apartments, Studios\n• Market Growth: +12% YoY\n• Best For: New investors starting their portfolio\n\n💡 RECOMMENDATION:\n• Start in Cairo if new (lower entry point)\n• Diversify between both cities for balanced growth\n• Dubai for premium properties, Cairo for value`
          : `🏙️ مقارنة دبي والقاهرة:\n\nدبي:\n• نطاق الأسعار: 10-250π\n• العائد المتوقع: 10-15% سنويًا\n• أنواع العقارات: فاخرة، مشاريع، فنادق\n• نمو السوق: +15% سنويًا\n• الأفضل للـ: المستثمرين المتقدمين\n\nالقاهرة:\n• نطاق الأسعار: 3-20π\n• العائد المتوقع: 6-12% سنويًا\n• أنواع العقارات: سكنية، شقق، استوديوهات\n• نمو السوق: +12% سنويًا\n• الأفضل للـ: المستثمرين الجدد\n\n💡 التوصية:\n• ابدأ بالقاهرة إذا كنت جديدًا\n• تنوع بين كلا المدينتين\n• دبي للعقارات الفاخرة`;
        return comparison;
      }

      // Default real estate advice
      return GENERAL_ADVICE[language];
    }

    // LOGIC 2: General Knowledge Keywords - Reply with real estate advice
    if (hasGeneralKeywords(userMessage)) {
      return GENERAL_ADVICE[language];
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
            headers: { 'Content-Type': 'application/json' },
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
              content: language === 'en'
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
            content: language === 'en'
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
          content: language === 'en' ? '📸 Analyzing property photo...' : '📸 جاري تحليل صورة العقار...',
          id: 'user-photo-' + Date.now(),
          photoUrl: imageData,
        };

        setMessages((prev) => [...prev, userMessage]);

        // Call API for analysis
        try {
          const response = await fetch('/api/analyze-property-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
              content: language === 'en' 
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
            content: language === 'en' 
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
                {language === 'en'
                  ? 'Aladdin AI'
                  : 'علاء الدين'}
              </h2>
              <p className="text-xs text-gray-400">
                {language === 'en' ? 'World-Class Real Estate Advisor' : 'مستشار عقاري عالمي'}
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
                        const cityInvest = language === 'en'
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
                      title={language === 'en' ? 'Listen to response' : 'استمع للإجابة'}
                    >
                      {playingMessageId === message.id ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>{language === 'en' ? 'Stop' : 'إيقاف'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>{language === 'en' ? 'Listen' : 'استمع'}</span>
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
                {language === 'en'
                  ? 'Suggested questions:'
                  : 'الأسئلة المقترحة:'}
              </p>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS[language].map((question, idx) => (
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
              {language === 'en' ? 'Analyze for:' : 'تحليل ل:'}
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
                language === 'en'
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
              title={language === 'en' ? 'Upload property photo for AI analysis' : 'تحميل صورة عقار للتحليل'}
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
        </div>
      </div>
    </div>
  );
}
