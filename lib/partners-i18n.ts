import type { NavLanguage } from './nav-i18n';
import { COUNTRIES } from './legal-profiles';

type Row = Record<NavLanguage, string>;
const r = (en: string, ar: string, fr: string, es: string, pt: string, ur: string, zh: string): Row => ({ en, ar, fr, es, pt, ur, zh });

export const PARTNER_TEXT = {
  title: r('Partners', 'الشركاء', 'Partenaires', 'Socios', 'Parceiros', 'شراکت دار', '合作伙伴'),
  tagline: r('Grow with RE: bring buyers, showcase projects, invest together.', 'انمُ مع RE: اجلب مشترين، اعرض مشاريعك، واستثمروا معًا.', 'Développez-vous avec RE : amenez des acheteurs, présentez vos projets, investissez ensemble.', 'Crece con RE: trae compradores, muestra proyectos e invierte en conjunto.', 'Cresça com a RE: traga compradores, apresente projetos e invista em conjunto.', 'RE کے ساتھ آگے بڑھیں: خریدار لائیں، منصوبے دکھائیں، مل کر سرمایہ کاری کریں۔', '与RE共同成长：带来买家、展示项目、联合投资。'),
  tracksTitle: r('Choose how you want to partner', 'اختر طريقة شراكتك', 'Choisissez votre type de partenariat', 'Elige cómo quieres asociarte', 'Escolha como quer ser parceiro', 'شراکت کا طریقہ منتخب کریں', '选择您的合作方式'),
  broker: r('Broker', 'وسيط عقاري', 'Courtier', 'Corredor', 'Corretor', 'بروکر', '经纪人'),
  developer: r('Developer', 'مطوّر عقاري', 'Promoteur', 'Desarrollador', 'Incorporador', 'ڈویلپر', '开发商'),
  investor: r('Investor', 'مستثمر', 'Investisseur', 'Inversor', 'Investidor', 'سرمایہ کار', '投资者'),
  sales: r('Sales agent', 'مندوب مبيعات', 'Agent commercial', 'Agente de ventas', 'Agente de vendas', 'سیلز ایجنٹ', '销售代表'),
  brokerPitch: r('Bring buyers and earn on every completed purchase.', 'اجلب مشترين واكسب عن كل عملية شراء مكتملة.', 'Amenez des acheteurs et gagnez sur chaque achat finalisé.', 'Trae compradores y gana en cada compra completada.', 'Traga compradores e ganhe em cada compra concluída.', 'خریدار لائیں اور ہر مکمل خریداری پر کمائیں۔', '带来买家，每笔完成的购买都有收益。'),
  developerPitch: r('Show your projects to a global audience of buyers.', 'اعرض مشاريعك على جمهور عالمي من المشترين.', 'Présentez vos projets à un public mondial d’acheteurs.', 'Muestra tus proyectos a compradores de todo el mundo.', 'Apresente seus projetos a compradores do mundo todo.', 'اپنے منصوبے دنیا بھر کے خریداروں کو دکھائیں۔', '向全球买家展示您的项目。'),
  investorPitch: r('Co-invest in vetted projects and bring fellow investors.', 'شارك في مشاريع موثوقة واجلب مستثمرين معك.', 'Co-investissez dans des projets vérifiés et faites venir d’autres investisseurs.', 'Coinvierte en proyectos verificados y trae a otros inversores.', 'Co-invista em projetos verificados e traga outros investidores.', 'منتخب منصوبوں میں مل کر سرمایہ کاری کریں اور دوسرے سرمایہ کار لائیں۔', '共同投资经审核的项目，并邀请其他投资者。'),
  salesPitch: r('Turn your network into income with a personal invite link.', 'حوّل شبكة معارفك إلى دخل برابط دعوة خاص بك.', 'Transformez votre réseau en revenu avec un lien d’invitation personnel.', 'Convierte tu red en ingresos con un enlace de invitación personal.', 'Transforme sua rede em renda com um link de convite pessoal.', 'ذاتی دعوتی لنک سے اپنے نیٹ ورک کو آمدن میں بدلیں۔', '用专属邀请链接把人脉变成收入。'),
  how: r('How it works', 'كيف يعمل', 'Comment ça marche', 'Cómo funciona', 'Como funciona', 'یہ کیسے کام کرتا ہے', '如何运作'),
  how1: r('1. Apply', '١. قدّم طلبك', '1. Postulez', '1. Solicita', '1. Candidate-se', '1. درخواست دیں', '1. 申请'),
  how1d: r('Tell us about your company or activity.', 'عرّفنا بشركتك أو نشاطك.', 'Présentez votre entreprise ou activité.', 'Cuéntanos sobre tu empresa o actividad.', 'Conte-nos sobre sua empresa ou atividade.', 'ہمیں اپنی کمپنی یا کام کے بارے میں بتائیں۔', '介绍您的公司或业务。'),
  how2: r('2. We review', '٢. نراجع طلبك', '2. Nous examinons', '2. Revisamos', '2. Analisamos', '2. ہم جائزہ لیتے ہیں', '2. 我们审核'),
  how2d: r('Our team reviews every application by hand.', 'فريقنا يراجع كل طلب يدويًا.', 'Notre équipe examine chaque demande manuellement.', 'Nuestro equipo revisa cada solicitud a mano.', 'Nossa equipe analisa cada pedido manualmente.', 'ہماری ٹیم ہر درخواست خود دیکھتی ہے۔', '团队逐一人工审核每份申请。'),
  how3: r('3. Invite & earn', '٣. ادعُ واكسب', '3. Invitez et gagnez', '3. Invita y gana', '3. Convide e ganhe', '3. دعوت دیں اور کمائیں', '3. 邀请并赚取'),
  how3d: r('Share your link. Your invited customers and commissions show up here.', 'شارك رابطك. عملاؤك المدعوّون وعمولاتك تظهر هنا.', 'Partagez votre lien. Vos clients invités et commissions apparaissent ici.', 'Comparte tu enlace. Tus clientes invitados y comisiones aparecen aquí.', 'Compartilhe seu link. Seus clientes convidados e comissões aparecem aqui.', 'اپنا لنک شیئر کریں۔ مدعو گاہک اور کمیشن یہاں نظر آئیں گے۔', '分享您的链接，受邀客户和佣金会显示在这里。'),
  rate: r('Commission', 'العمولة', 'Commission', 'Comisión', 'Comissão', 'کمیشن', '佣金'),
  ratePer: r('of each completed purchase', 'من كل عملية شراء مكتملة', 'de chaque achat finalisé', 'de cada compra completada', 'de cada compra concluída', 'ہر مکمل خریداری کا', '每笔完成的购买'),
  rateNone: r('Set by the platform team', 'تحددها إدارة المنصة', 'Fixée par l’équipe de la plateforme', 'La define el equipo de la plataforma', 'Definida pela equipe da plataforma', 'پلیٹ فارم ٹیم طے کرتی ہے', '由平台团队设定'),
  applyTitle: r('Apply to become a partner', 'قدّم طلب الانضمام كشريك', 'Postuler pour devenir partenaire', 'Solicita ser socio', 'Candidate-se a parceiro', 'شراکت دار بننے کے لیے درخواست دیں', '申请成为合作伙伴'),
  fRole: r('Partner type', 'نوع الشراكة', 'Type de partenaire', 'Tipo de socio', 'Tipo de parceiro', 'شراکت کی قسم', '合作类型'),
  fCompany: r('Company or business name', 'اسم الشركة أو النشاط', 'Nom de l’entreprise', 'Nombre de la empresa', 'Nome da empresa', 'کمپنی یا کاروبار کا نام', '公司或业务名称'),
  fCountry: r('Country', 'الدولة', 'Pays', 'País', 'País', 'ملک', '国家'),
  fPhone: r('Phone (with country code)', 'الهاتف (مع كود الدولة)', 'Téléphone (avec indicatif)', 'Teléfono (con prefijo)', 'Telefone (com código do país)', 'فون (ملکی کوڈ کے ساتھ)', '电话（含国家区号）'),
  fAbout: r('About your business', 'عن نشاطك', 'À propos de votre activité', 'Sobre tu negocio', 'Sobre o seu negócio', 'آپ کے کاروبار کے بارے میں', '关于您的业务'),
  fAboutHint: r('At least 20 characters: what you do and where.', '20 حرفًا على الأقل: ماذا تعمل وفي أي مكان.', 'Au moins 20 caractères : ce que vous faites et où.', 'Al menos 20 caracteres: qué haces y dónde.', 'Pelo menos 20 caracteres: o que faz e onde.', 'کم از کم 20 حروف: آپ کیا کرتے ہیں اور کہاں۔', '至少20个字符：您做什么、在哪里。'),
  fWebsite: r('Website (optional, https://)', 'الموقع (اختياري، https://)', 'Site web (facultatif, https://)', 'Sitio web (opcional, https://)', 'Site (opcional, https://)', 'ویب سائٹ (اختیاری، https://)', '网站（可选，https://）'),
  fListed: r('Show my company in the public partners directory', 'أظهر شركتي في دليل الشركاء العام', 'Afficher mon entreprise dans l’annuaire public', 'Mostrar mi empresa en el directorio público', 'Mostrar minha empresa no diretório público', 'میری کمپنی عوامی ڈائریکٹری میں دکھائیں', '在公开合作伙伴名录中显示我的公司'),
  submit: r('Send application', 'إرسال الطلب', 'Envoyer la demande', 'Enviar solicitud', 'Enviar pedido', 'درخواست بھیجیں', '提交申请'),
  sending: r('Sending…', 'جارٍ الإرسال…', 'Envoi…', 'Enviando…', 'Enviando…', 'بھیجا جا رہا ہے…', '发送中…'),
  errRole: r('Choose a partner type.', 'اختر نوع الشراكة.', 'Choisissez un type de partenaire.', 'Elige un tipo de socio.', 'Escolha um tipo de parceiro.', 'شراکت کی قسم منتخب کریں۔', '请选择合作类型。'),
  errCompany: r('Enter your company name.', 'اكتب اسم الشركة.', 'Saisissez le nom de l’entreprise.', 'Escribe el nombre de la empresa.', 'Digite o nome da empresa.', 'کمپنی کا نام لکھیں۔', '请输入公司名称。'),
  errCountry: r('Choose a country.', 'اختر الدولة.', 'Choisissez un pays.', 'Elige un país.', 'Escolha um país.', 'ملک منتخب کریں۔', '请选择国家。'),
  errPhone: r('Enter a valid phone number.', 'اكتب رقم هاتف صحيح.', 'Saisissez un numéro valide.', 'Escribe un teléfono válido.', 'Digite um telefone válido.', 'درست فون نمبر لکھیں۔', '请输入有效的电话号码。'),
  errAbout: r('Write at least 20 characters about your business.', 'اكتب 20 حرفًا على الأقل عن نشاطك.', 'Écrivez au moins 20 caractères sur votre activité.', 'Escribe al menos 20 caracteres sobre tu negocio.', 'Escreva pelo menos 20 caracteres sobre seu negócio.', 'اپنے کاروبار کے بارے میں کم از کم 20 حروف لکھیں۔', '请至少用20个字符介绍您的业务。'),
  errWebsite: r('The website must start with https://', 'يجب أن يبدأ الموقع بـ https://', 'Le site doit commencer par https://', 'El sitio debe empezar por https://', 'O site deve começar com https://', 'ویب سائٹ https:// سے شروع ہو', '网站必须以 https:// 开头'),
  errExists: r('You already have an application.', 'لديك طلب بالفعل.', 'Vous avez déjà une demande.', 'Ya tienes una solicitud.', 'Você já tem um pedido.', 'آپ کی درخواست پہلے سے موجود ہے۔', '您已有一份申请。'),
  errGeneric: r('Something went wrong. Please try again.', 'حدث خطأ. حاول مرة أخرى.', 'Une erreur est survenue. Réessayez.', 'Algo salió mal. Inténtalo de nuevo.', 'Algo deu errado. Tente novamente.', 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔', '出错了，请重试。'),
  signIn: r('Sign in to apply or see your partner dashboard.', 'سجّل الدخول لتقدّم طلبك أو تطّلع على لوحة الشريك.', 'Connectez-vous pour postuler ou voir votre tableau de bord.', 'Inicia sesión para solicitar o ver tu panel de socio.', 'Entre para se candidatar ou ver seu painel de parceiro.', 'درخواست دینے یا اپنا ڈیش بورڈ دیکھنے کے لیے سائن اِن کریں۔', '请登录后申请或查看您的合作伙伴面板。'),
  pendingT: r('Application under review', 'طلبك قيد المراجعة', 'Demande en cours d’examen', 'Solicitud en revisión', 'Pedido em análise', 'درخواست زیرِ جائزہ ہے', '申请审核中'),
  pendingB: r('We review every application by hand. The result will appear here.', 'نراجع كل طلب يدويًا. ستظهر النتيجة هنا.', 'Nous examinons chaque demande manuellement. Le résultat s’affichera ici.', 'Revisamos cada solicitud a mano. El resultado aparecerá aquí.', 'Analisamos cada pedido manualmente. O resultado aparecerá aqui.', 'ہم ہر درخواست خود دیکھتے ہیں۔ نتیجہ یہاں نظر آئے گا۔', '我们逐一人工审核，结果会显示在这里。'),
  rejectedT: r('Application not approved', 'لم تتم الموافقة على الطلب', 'Demande non approuvée', 'Solicitud no aprobada', 'Pedido não aprovado', 'درخواست منظور نہیں ہوئی', '申请未通过'),
  rejectedB: r('You can fix the details and apply again.', 'يمكنك تعديل البيانات والتقديم من جديد.', 'Vous pouvez corriger les informations et postuler à nouveau.', 'Puedes corregir los datos y volver a solicitar.', 'Você pode corrigir os dados e se candidatar de novo.', 'آپ تفصیلات درست کر کے دوبارہ درخواست دے سکتے ہیں۔', '您可以修改信息后重新申请。'),
  reapply: r('Apply again', 'قدّم من جديد', 'Postuler à nouveau', 'Solicitar de nuevo', 'Candidatar-se de novo', 'دوبارہ درخواست دیں', '重新申请'),
  noteLabel: r('Note from the team', 'ملاحظة من الفريق', 'Note de l’équipe', 'Nota del equipo', 'Nota da equipe', 'ٹیم کا نوٹ', '团队备注'),
  suspendedT: r('Partnership paused', 'الشراكة متوقفة مؤقتًا', 'Partenariat suspendu', 'Alianza en pausa', 'Parceria pausada', 'شراکت معطل ہے', '合作已暂停'),
  suspendedB: r('Your partner account is paused. Contact support for details.', 'حساب الشريك متوقف مؤقتًا. تواصل مع الدعم للتفاصيل.', 'Votre compte partenaire est suspendu. Contactez le support.', 'Tu cuenta de socio está en pausa. Contacta con soporte.', 'Sua conta de parceiro está pausada. Fale com o suporte.', 'آپ کا پارٹنر اکاؤنٹ معطل ہے۔ تفصیل کے لیے سپورٹ سے رابطہ کریں۔', '您的合作伙伴账户已暂停，请联系客服了解详情。'),
  approvedT: r('Your partner dashboard', 'لوحة الشريك الخاصة بك', 'Votre tableau de bord partenaire', 'Tu panel de socio', 'Seu painel de parceiro', 'آپ کا پارٹنر ڈیش بورڈ', '您的合作伙伴面板'),
  inviteLink: r('Your invite link', 'رابط الدعوة الخاص بك', 'Votre lien d’invitation', 'Tu enlace de invitación', 'Seu link de convite', 'آپ کا دعوتی لنک', '您的邀请链接'),
  inviteCode: r('Code', 'الكود', 'Code', 'Código', 'Código', 'کوڈ', '代码'),
  copy: r('Copy link', 'نسخ الرابط', 'Copier le lien', 'Copiar enlace', 'Copiar link', 'لنک کاپی کریں', '复制链接'),
  copied: r('Copied', 'تم النسخ', 'Copié', 'Copiado', 'Copiado', 'کاپی ہو گیا', '已复制'),
  invited: r('Invited', 'تم دعوتهم', 'Invités', 'Invitados', 'Convidados', 'مدعو', '已邀请'),
  qualified: r('Made a purchase', 'أتمّوا شراء', 'Ont acheté', 'Compraron', 'Compraram', 'خریداری مکمل کی', '已购买'),
  earnings: r('Commissions', 'العمولات', 'Commissions', 'Comisiones', 'Comissões', 'کمیشن', '佣金'),
  owed: r('Owed to you', 'مستحقة لك', 'Dues', 'Pendiente', 'A receber', 'واجب الادا', '待支付'),
  paid: r('Paid', 'تم دفعها', 'Payées', 'Pagadas', 'Pagas', 'ادا شدہ', '已支付'),
  noEarnings: r('No commissions yet. They appear when customers you invited complete a purchase.', 'لا توجد عمولات بعد. ستظهر عندما يُكمل العملاء الذين دعوتهم عملية شراء.', 'Aucune commission pour l’instant. Elles apparaissent quand vos invités finalisent un achat.', 'Aún no hay comisiones. Aparecen cuando tus invitados completan una compra.', 'Ainda sem comissões. Elas aparecem quando seus convidados concluem uma compra.', 'ابھی کوئی کمیشن نہیں۔ مدعو گاہک خریداری مکمل کریں تو یہاں آئے گا۔', '暂无佣金。受邀客户完成购买后会显示在这里。'),
  recent: r('Latest commissions', 'آخر العمولات', 'Dernières commissions', 'Últimas comisiones', 'Últimas comissões', 'تازہ ترین کمیشن', '最新佣金'),
  rulesNote: r('Commission applies to completed property purchases by new customers who joined with your code, after your approval. Payments are settled by the team outside the app.', 'العمولة على عمليات شراء العقارات المكتملة من عملاء جدد سجّلوا بكودك، بعد موافقتنا عليك. يتم الدفع من الفريق خارج التطبيق.', 'La commission porte sur les achats immobiliers finalisés de nouveaux clients inscrits avec votre code, après votre approbation. Le paiement est réglé par l’équipe hors de l’application.', 'La comisión se aplica a compras inmobiliarias completadas por clientes nuevos que se unieron con tu código, tras tu aprobación. El pago lo realiza el equipo fuera de la app.', 'A comissão vale para compras de imóveis concluídas por novos clientes que entraram com seu código, após sua aprovação. O pagamento é feito pela equipe fora do app.', 'کمیشن ان نئے گاہکوں کی مکمل جائیداد خریداری پر ہے جو آپ کے کوڈ سے آئے، آپ کی منظوری کے بعد۔ ادائیگی ٹیم ایپ سے باہر کرتی ہے۔', '佣金适用于使用您的代码加入的新客户在您获批后完成的房产购买。款项由团队在应用外结算。'),
  programOff: r('The commission program is paused right now. Your invites are still counted.', 'برنامج العمولات متوقف حاليًا. ما زالت دعواتك تُحتسب.', 'Le programme de commissions est en pause. Vos invitations sont toujours comptées.', 'El programa de comisiones está en pausa. Tus invitaciones se siguen contando.', 'O programa de comissões está pausado. Seus convites continuam sendo contados.', 'کمیشن پروگرام فی الحال رکا ہوا ہے۔ آپ کی دعوتیں پھر بھی گنی جاتی ہیں۔', '佣金计划目前暂停，您的邀请仍会计入。'),
  directoryT: r('Partner directory', 'دليل الشركاء', 'Annuaire des partenaires', 'Directorio de socios', 'Diretório de parceiros', 'پارٹنر ڈائریکٹری', '合作伙伴名录'),
  directoryEmpty: r('Approved partners will appear here.', 'سيظهر الشركاء المعتمدون هنا.', 'Les partenaires approuvés apparaîtront ici.', 'Los socios aprobados aparecerán aquí.', 'Os parceiros aprovados aparecerão aqui.', 'منظور شدہ شراکت دار یہاں نظر آئیں گے۔', '获批的合作伙伴将显示在这里。'),
  visit: r('Visit website', 'زيارة الموقع', 'Visiter le site', 'Visitar el sitio', 'Visitar o site', 'ویب سائٹ دیکھیں', '访问网站'),
  showcase: r('Our partners', 'شركاؤنا', 'Nos partenaires', 'Nuestros socios', 'Nossos parceiros', 'ہمارے شراکت دار', '我们的合作伙伴'),
  loading: r('Loading…', 'جارٍ التحميل…', 'Chargement…', 'Cargando…', 'Carregando…', 'لوڈ ہو رہا ہے…', '加载中…'),
  loadError: r('Could not load. Please try again.', 'تعذّر التحميل. حاول مرة أخرى.', 'Chargement impossible. Réessayez.', 'No se pudo cargar. Inténtalo de nuevo.', 'Não foi possível carregar. Tente novamente.', 'لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔', '无法加载，请重试。'),
  retry: r('Retry', 'إعادة المحاولة', 'Réessayer', 'Reintentar', 'Tentar de novo', 'دوبارہ کوشش کریں', '重试'),
  back: r('Back', 'رجوع', 'Retour', 'Atrás', 'Voltar', 'واپس', '返回'),
} satisfies Record<string, Row>;

export type PartnerTextKey = keyof typeof PARTNER_TEXT;
export const pt = (key: PartnerTextKey, language: string): string => {
  const row = PARTNER_TEXT[key] as Row;
  return row[language as NavLanguage] ?? row.en;
};

// Country names exist in English and Arabic only; every other language shows the English one.
export const countryName = (code: string, language: string): string => {
  const c = COUNTRIES[code];
  if (!c) return code;
  return language === 'ar' ? c.ar : c.en;
};

export const FIELD_ERROR: Record<string, PartnerTextKey> = { role: 'errRole', company: 'errCompany', country: 'errCountry', phone: 'errPhone', about: 'errAbout', website: 'errWebsite' };
