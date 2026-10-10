# اختبار الأداء - Performance Benchmarks

## أدوات القياس الموصى بها

### 1. Chrome DevTools Performance
\`\`\`
1. افتح Chrome DevTools (F12)
2. اذهب إلى Performance tab
3. اضغط Record
4. قم بالإجراء المراد قياسه
5. اضغط Stop
6. اعرض النتائج في الـ report
\`\`\`

### 2. Lighthouse في Chrome
\`\`\`
1. افتح Chrome DevTools
2. اذهب إلى Lighthouse tab
3. اختر Mobile/Desktop
4. اضغط Generate report
5. اعرض النتائج:
   - Performance Score (0-100)
   - Core Web Vitals
   - Best Practices
\`\`\`

### 3. WebPageTest (web-based)
\`\`\`
https://www.webpagetest.org/
- اختر الموقع الجغرافي
- اختر نوع الجهاز
- اختر سرعة الإنترنت
- اضغط "Start Test"
\`\`\`

---

## قياسات الأداء الرئيسية

### Core Web Vitals

#### 1. Largest Contentful Paint (LCP)
**الهدف**: < 2.5 ثانية

\`\`\`bash
# قياس موجود في usePerformanceMonitoring
- عند تحميل الصفحة الأولى
- عند تغيير الصفحة
- عند تحميل صور كبيرة
\`\`\`

#### 2. Cumulative Layout Shift (CLS)
**الهدف**: < 0.1

\`\`\`bash
# يقيس الحركة المتوقعة من العناصر
- عدم وجود متسعات
- الصور بنسب محددة
- الخطوط محملة مسبقاً
\`\`\`

#### 3. Interaction to Next Paint (INP)
**الهدف**: < 200ms

\`\`\`bash
# يقيس استجابة المتفاعلات
- النقرات على الأزرار
- إدخالات النص
- الحركات على الصفحة
\`\`\`

---

## اختبارات الأداء التفصيلية

### اختبار 1: Bundle Size

\`\`\`bash
# قياس حجم bundle
npm run build

# النتائج المتوقعة:
# قبل: ~500KB
# بعد: ~250-300KB
# التحسن: -40-50%
\`\`\`

### اختبار 2: Cache Effectiveness

\`\`\`typescript
// في console:
import { getCacheStats } from '@/lib/cache-manager';

// قبل التحسينات:
console.log(getCacheStats()); // cacheSize: 0, pendingRequests: 100+

// بعد التحسينات:
console.log(getCacheStats()); // cacheSize: 15-20, pendingRequests: 2-3
\`\`\`

### اختبار 3: Virtual Scrolling

\`\`\`typescript
// قياس عدد الـ DOM elements
// قبل:
document.querySelectorAll('[role="listitem"]').length; // 1000+

// بعد (مع virtual scrolling):
document.querySelectorAll('[role="listitem"]').length; // 10-15
\`\`\`

### اختبار 4: Image Loading

\`\`\`typescript
// في Network tab في DevTools:
// Filter: img
// قبل: جميع الصور تحمل مرة واحدة
// بعد: الصور تحمل عند الوصول إليها
\`\`\`

### اختبار 5: API Requests

\`\`\`typescript
// في Network tab:
// قبل: 150+ requests per session
// بعد: 20-30 requests per session

// الطلبات المكررة تختفي بسبب:
// - Request deduplication
// - Caching strategy
// - SWR revalidation
\`\`\`

---

## القياسات تحت ظروف مختلفة

### على الـ Mobile (3G)
\`\`\`
Simulated speed: 400KB/s
Latency: 400ms

- FCP: 3-4s → 1.5-2s
- LCP: 5-6s → 2.5-3.5s
- TTI: 7-8s → 3-4s
\`\`\`

### على الـ Desktop (Fast 3G)
\`\`\`
Simulated speed: 1.6MB/s
Latency: 150ms

- FCP: 1.2-1.5s → 0.8-1s
- LCP: 2.5-3s → 1.5-2s
- TTI: 3-4s → 1.5-2s
\`\`\`

### على الـ Slow Network (Slow 4G)
\`\`\`
Simulated speed: 2MB/s
Latency: 1000ms

- FCP: 4-5s → 2-2.5s
- LCP: 6-7s → 3-3.5s
- TTI: 8-9s → 4-5s
\`\`\`

---

## Performance Metrics Dashboard

### في Console (Development):

\`\`\`typescript
// عرض الإحصائيات الكاملة
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

// يطبع تلقائياً:
[Performance] Component took 45.23ms to render
[LCP] 1850
[CLS] 0.05
[INP] 120
[Memory] 32.45MB / 512MB (6.3%)
\`\`\`

---

## Checklist اختبار الأداء

### قبل النشر (Pre-deployment)

- [ ] فحص Lighthouse score > 90
- [ ] LCP < 2.5s على المحمول
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Bundle size < 300KB (gzipped)
- [ ] API requests < 50 per session
- [ ] Memory usage < 50MB على المحمول
- [ ] Core Web Vitals passed

### بعد النشر (Post-deployment)

- [ ] رصد Real User Metrics (RUM)
- [ ] تحذيرات الأداء في الإنتاج
- [ ] تحليل أنماط المستخدمين
- [ ] تحسين ديناميكي حسب البيانات

---

## استكشاف الأخطاء

### البطء في التحميل الأولي
\`\`\`
المسببات الشائعة:
1. عدم استخدام lazy loading للصور
   → الحل: استخدم LazyImage component
   
2. تحميل جميع المكونات مرة واحدة
   → الحل: استخدم dynamic imports
   
3. عدم استخدام caching للـ API
   → الحل: استخدم cachedFetch من cache-manager
\`\`\`

### استهلاك ذاكرة عالي
\`\`\`
المسببات الشائعة:
1. عرض 1000+ عنصر في الـ DOM
   → الحل: استخدم VirtualList component
   
2. عدم تنظيف الـ event listeners
   → الحل: استخدم useEffect cleanup
   
3. أحجام صور كبيرة جداً
   → الحل: استخدم image optimization في Next.js
\`\`\`

### حركات متقطعة (Jank)
\`\`\`
المسببات الشائعة:
1. عمليات حسابية ثقيلة في main thread
   → الحل: استخدم Web Workers أو useMemo
   
2. animations بدون GPU acceleration
   → الحل: استخدم transform و opacity فقط
   
3. إعادة تصيير متكررة دون داع
   → الحل: استخدم React.memo و useCallback
\`\`\`

---

## الأدوات المساعدة

### 1. Bundle Analyzer
\`\`\`bash
npm install --save-dev @next/bundle-analyzer

# في next.config.mjs:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

# الاستخدام:
ANALYZE=true npm run build
\`\`\`

### 2. Performance Monitoring
\`\`\`typescript
// استخدم usePerformanceMonitoring في المكونات
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

function MyComponent() {
  usePerformanceMonitoring('MyComponent');
  // ...
}
\`\`\`

### 3. Memory Profiler
\`\`\`bash
# في Chrome DevTools:
1. Performance → Memory
2. Take heap snapshot
3. اعرض الـ objects الأكبر
4. ابحث عن تسريبات الذاكرة
\`\`\`

---

## الهدف النهائي

| Metric | قبل | بعد | التحسن |
|--------|------|------|---------|
| Bundle Size | 500KB | 250-300KB | -40-50% |
| FCP | 2.5s | 1.2-1.5s | -50-55% |
| LCP | 4.2s | 2.5-3s | -35-40% |
| Memory | 45MB | 30-35MB | -25-30% |
| API Requests | 150+ | 20-30 | -85-90% |
| Lighthouse | 65-75 | 90+ | +20-30 |

---

## المراجع

- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [React Performance](https://react.dev/reference/react/useMemo)
