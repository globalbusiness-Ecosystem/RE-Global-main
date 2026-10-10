# QR Code System - نظام الكود QR الكامل

## نظرة عامة
نظام متكامل لإنشاء وإدارة رموز QR لكل عقار في منصة RE، يوفر سهولة الوصول والمشاركة.

## المكونات الرئيسية

### 1. QRCodeGenerator (مولد QR Code)
**الملف:** `components/qr-code-generator.tsx`

يعرض رمز QR الفردي مع خيارات التحميل والنسخ.

**المميزات:**
- إنشاء QR code ديناميكي
- تحميل كصورة PNG
- نسخ إلى الحافظة
- دعم الأحجام المختلفة

### 2. QRCodeModal (نافذة QR Code)
**الملف:** `components/qr-code-modal.tsx`

نافذة منبثقة شاملة عند الضغط على زر QR Code في بطاقة العقار.

**المميزات:**
- عرض رمز QR
- عرض تفاصيل العقار (السعر، الموقع، الغرف، المساحة)
- خيارات المشاركة والطباعة
- دعم اللغتين (EN/AR)

### 3. QRCodesManager (مدير QR Codes)
**الملف:** `components/qr-codes-manager.tsx`

صفحة إدارة شاملة لعرض جميع رموز QR للعقارات.

**المميزات:**
- عرض بطريقة الشبكة أو القائمة
- تحميل فردي أو جماعي
- نسخ الروابط
- طباعة الرموز

## الوظائف المساعدة

**الملف:** `lib/qr-code-utils.ts`

### الدوال الأساسية:

1. **generatePropertyQRUrl()**
   - إنشاء رابط QR code للعقار
   - استخدام QR Server API المجاني
   - دعم الأحجام المختلفة

2. **validateQRData()**
   - التحقق من صحة بيانات العقار
   - التأكد من وجود المعلومات المطلوبة

3. **downloadQRCode()**
   - تحميل رمز QR كصورة PNG
   - إعادة تسمية تلقائية بمعرف العقار

4. **copyQRCodeToClipboard()**
   - نسخ رابط العقار إلى الحافظة
   - إرجاع حالة النجاح

5. **generateBatchQRCodes()**
   - إنشاء رموز متعددة دفعة واحدة
   - مفيد للتصدير الجماعي

6. **printQRCode()**
   - طباعة رمز QR مع تفاصيل العقار
   - تنسيق احترافي للطباعة

## API Endpoint

**المسار:** `POST /api/qr-code`

### الطلب (Request):
```json
{
  "propertyId": "prop-123",
  "propertyName": "Luxury Villa",
  "price": 500,
  "city": "Dubai",
  "bedrooms": 4,
  "area": 400,
  "currency": "π"
}
```

### الاستجابة (Response):
```json
{
  "success": true,
  "propertyId": "prop-123",
  "qrCode": "https://api.qrserver.com/v1/create-qr-code/?...",
  "shareUrl": "https://re.pi?property=prop-123",
  "metadata": {
    "property": "Luxury Villa",
    "price": 500,
    "city": "Dubai",
    "bedrooms": 4,
    "area": 400
  }
}
```

## التكامل مع بطاقة العقار

### في `components/property-card.tsx`:

1. استيراد المكونات:
```tsx
import { QRCodeModal } from './qr-code-modal';
```

2. إضافة State:
```tsx
const [qrCodeOpen, setQrCodeOpen] = useState(false);
```

3. زر QR Code:
```tsx
<button
  onClick={() => setQrCodeOpen(true)}
  className="...QR Code..."
>
  <QrCode className="w-3 h-3" />
  QR Code
</button>
```

4. عرض Modal:
```tsx
<QRCodeModal
  isOpen={qrCodeOpen}
  onClose={() => setQrCodeOpen(false)}
  propertyId={id}
  propertyName={displayTitle}
  price={price}
  city={city}
  bedrooms={bedrooms}
  area={area}
  language={language}
/>
```

## حالات الاستخدام

### 1. المشترون والمستثمرون
- فحص العقار بسهولة من خلال المسح الضوئي
- الوصول الفوري إلى التفاصيل الكاملة
- مشاركة العقار عبر الوسائط الاجتماعية

### 2. الوكلاء العقاريون
- طباعة رموز QR على المواد التسويقية
- مشاركة سريعة مع العملاء
- تتبع المشاهدات والاهتمام

### 3. الإعلانات المطبوعة
- تضمين QR codes في الإعلانات الورقية
- ربط البيئة الورقية بالرقمية
- تحليل التفاعل

### 4. لافتات العقارات
- وضع QR code على اللافتات في موقع العقار
- عرض الصور والتفاصيل على الفور

## الميزات الأمنية

1. **الترميز الآمن:**
   - استخدام معرفات فريدة للعقارات
   - لا تخزين بيانات حساسة في QR

2. **التوافق:**
   - تعمل مع جميع ماسحات QR العادية
   - معايير ISO/IEC 18004

3. **التحقق:**
   - التحقق من صحة بيانات العقار قبل الإنشاء
   - معالجة الأخطاء الشاملة

## الأداء

- **حجم QR:** 256x256 (معاينة) إلى 512x512 (طباعة)
- **API Server:** استخدام خدمة QR Server المجانية
- **وقت الإنشاء:** <100ms
- **Cache:** أرقام QR مخزنة مؤقتاً للأداء

## التدويل

**اللغات المدعومة:**
- English (EN)
- العربية (AR)

**التنسيقات:**
- النقود: π (Pi Network)
- المساحة: m²
- اتجاه النص: RTL للعربية، LTR للإنجليزية

## الخطوات التالية

1. **تحليلات:**
   - تتبع عدد مسحات QR
   - تحليل المناطق الجغرافية

2. **التحسينات:**
   - إضافة ألوان مخصصة للعقار
   - شعار العقار في الوسط

3. **التكامل:**
   - مع Google Analytics
   - مع نظام إدارة المبيعات (CRM)

## الدعم الفني

للمشاكل أو الاستفسارات:
- البريد الإلكتروني: support@re.pi
- WhatsApp: +201010810558
