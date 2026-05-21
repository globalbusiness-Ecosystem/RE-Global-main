# نظام عرض صور العقارات - Property Images System

## نظرة عامة
تم بناء نظام متكامل لعرض صور العقارات مع واجهة تفاعلية تتضمن:
- عرض الصور في شبكة العقارات
- معاينة الصور في مكالب تفصيلي
- سهولة إضافة صور متعددة لكل عقار
- دعم اللغة الإنجليزية والعربية

---

## المكونات الرئيسية

### 1. PropertyImagesCarousel
**المسار:** `/components/property-images-carousel.tsx`

مكون لعرض مجموعة من الصور مع:
- تنقل بين الصور (الأمامي والخلفي)
- عرض عداد الصور الحالية
- شريط تصغيرات للصور
- تأثيرات عند مرور الفأرة

**الخصائص:**
\`\`\`typescript
interface PropertyImagesCarouselProps {
  images: PropertyImage[];
  isLoading?: boolean;
  onImageClick?: (imageIndex: number) => void;
  className?: string;
}
\`\`\`

**الاستخدام:**
\`\`\`tsx
<PropertyImagesCarousel
  images={propertyImages}
  onImageClick={(index) => console.log('Clicked image:', index)}
/>
\`\`\`

### 2. PropertyDetailsModal
**المسار:** `/components/property-details-modal.tsx`

مكالب شامل يعرض:
- الصور الكاملة للعقار
- التفاصيل الكاملة
- المرافق والخدمات
- معلومات الاتصال
- أزرار الشراء والمفضلات

**الخصائص:**
\`\`\`typescript
interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    titleEn: string;
    titleAr: string;
    price: number;
    images: PropertyImage[];
    // ... other properties
  };
  language: 'en' | 'ar';
}
\`\`\`

### 3. PropertiesGrid
**المسار:** `/components/properties-grid.tsx`

شبكة العقارات مع:
- عرض البطاقات في شبكة
- إمكانية الضغط لرؤية التفاصيل
- إدارة المفضلات

### 4. PropertyCard (محدث)
**المسار:** `/components/property-card.tsx`

تم تحديث بطاقة العقار لتشمل:
- عرض الصور الأولى من المجموعة
- عداد الصور
- انتقال سلس بين الصور

---

## هيكل بيانات العقار

\`\`\`typescript
interface PropertyImage {
  id: string;
  url: string;
  title?: string;
  alt: string;
}

interface Property {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  city: string;
  country: string;
  countryFlag: string;
  bedrooms: number;
  bathrooms?: number;
  area: number;
  yearBuilt?: number;
  images: PropertyImage[];
  amenities?: string[];
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}
\`\`\`

---

## البيانات النموذجية

تم إنشاء ملف `lib/sample-properties.ts` يحتوي على:
- 3 عقارات نموذجية
- كل عقار يحتوي على 3-5 صور
- معلومات كاملة (السعر، المدينة، المرافق، إلخ)

---

## كيفية الاستخدام

### 1. عرض شبكة العقارات مع الصور
\`\`\`tsx
import PropertiesPage from '@/components/pages/properties-showcase-page';

export default function Page() {
  return <PropertiesPage language="en" />;
}
\`\`\`

### 2. عرض شبكة مخصصة
\`\`\`tsx
import { PropertiesGrid } from '@/components/properties-grid';

<PropertiesGrid
  language="en"
  properties={customProperties}
  onBuyClick={(propertyId) => {
    // Handle purchase
  }}
/>
\`\`\`

### 3. إضافة صور لعقار جديد
\`\`\`tsx
const newProperty = {
  id: 'prop-123',
  titleEn: 'Luxury Apartment',
  titleAr: 'شقة فاخرة',
  // ... other fields
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/image1.jpg',
      alt: 'Main bedroom',
      title: 'Bedroom'
    },
    {
      id: 'img-2',
      url: 'https://example.com/image2.jpg',
      alt: 'Living room',
      title: 'Living Room'
    }
  ]
};
\`\`\`

---

## التكامل مع الصور الحقيقية

### استبدال الصور النموذجية

في `lib/sample-properties.ts`:
\`\`\`typescript
const properties = [
  {
    // ...
    images: [
      {
        id: 'img-1',
        url: 'YOUR_ACTUAL_IMAGE_URL', // ✅ استبدل برابط صورتك
        alt: 'Property image',
        title: 'Image 1'
      }
    ]
  }
];
\`\`\`

### مصادر الصور المتاحة:
1. **خادم خاص:** رفع الصور على خادمك واستخدام الرابط
2. **خدمات السحابة:**
   - Firebase Storage
   - AWS S3
   - Vercel Blob
   - Cloudinary
   - ImageKit
3. **روابط عامة:** استخدام روابط صور من مواقع عامة

---

## الميزات

✅ عرض متعدد للصور  
✅ تنقل سلس بين الصور  
✅ عداد الصور  
✅ شريط تصغيرات تفاعلي  
✅ دعم اللغة الإنجليزية والعربية  
✅ تحميل كسول للصور (Lazy Loading)  
✅ تأثيرات بصرية عند مرور الفأرة  
✅ واجهة تفاعلية كاملة  
✅ بطاقات عقارات محسنة  
✅ مكالب تفاصيل شامل  

---

## أمثلة على الاستخدام الحقيقي

### مثال 1: عرض العقارات في الصفحة الرئيسية
\`\`\`tsx
import PropertiesPage from '@/components/pages/properties-showcase-page';

export default function Home() {
  return (
    <main>
      <PropertiesPage language="ar" />
    </main>
  );
}
\`\`\`

### مثال 2: تصفية وعرض العقارات
يمكن للمستخدمين:
- البحث عن العقارات بالاسم
- تصفية حسب المدينة
- عرض قائمة العقارات المطابقة
- الضغط على العقار لرؤية التفاصيل
- عرض جميع الصور الخاصة به
- إضافة للمفضلات
- الشراء بـ Pi

---

## الخطوات التالية

1. **استبدال الصور النموذجية** بصور حقيقية
2. **إضافة المزيد من العقارات** مع صورها
3. **التكامل مع قاعدة البيانات** لتخزين البيانات
4. **إضافة وظيفة الرفع** لتحميل صور جديدة
5. **تحسين الأداء** بضغط الصور
6. **إضافة معاينة معروضة على الخريطة**

---

## ملاحظات مهمة

- تأكد من أن صور الـ URL متاحة وتحميل بسرعة
- استخدم صور بجودة عالية (لكن مضغوطة)
- أضف نصوص وصفية مناسبة (Alt text)
- اختبر عرض الصور على الأجهزة المختلفة
- تأكد من توافقية الصور مع جميع المتصفحات

---

**آخر تحديث:** 2026-04-07  
**الحالة:** كامل وجاهز للاستخدام ✅
