// Static content for the Aladdin chat widget (moved out of components/ai-advisor-chat.tsx, unchanged).

export const SUGGESTED_QUESTIONS = {
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

// Legal Framework by Country
export const LEGAL_FRAMEWORK = {
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
export const PROPERTY_DATABASE = {
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

export const MARKET_TRENDS = {
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

export const PI_PAYMENTS_GUIDE = {
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

export const GENERAL_ADVICE = {
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
