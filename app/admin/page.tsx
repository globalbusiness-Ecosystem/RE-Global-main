'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ADMIN_PIN = '3027913091994Qwertyuiop*#@';

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', price: '', currency: 'Pi', location: '', type: 'buy',
    propertyType: 'apartment', status: 'available', bedrooms: '', bathrooms: '',
    area: '', description: '', image: '', images: '', vrUrl: '',
    tokenized: false, amenities: { pool: false, gym: false, parking: false, security: false }
  });

  const handleLogin = () => {
    if (pin === ADMIN_PIN) setAuthenticated(true);
    else alert('PIN غلط!');
  };

  const loadProperties = async () => {
    const snap = await getDocs(collection(db, 'properties'));
    setProperties(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { if (authenticated) loadProperties(); }, [authenticated]);

  const handleAdd = async () => {
    await addDoc(collection(db, 'properties'), {
      ...form,
      images: form.images.split(',').map(s => s.trim()).filter(Boolean)
    });
    alert('✅ تم إضافة العقار!');
    setForm({
      title: '', price: '', currency: 'Pi', location: '', type: 'buy',
      propertyType: 'apartment', status: 'available', bedrooms: '', bathrooms: '',
      area: '', description: '', image: '', images: '', vrUrl: '',
      tokenized: false, amenities: { pool: false, gym: false, parking: false, security: false }
    });
    loadProperties();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'properties', id));
    loadProperties();
  };

  const inp = (ph: string, key: string) => (
    <input placeholder={ph} value={(form as any)[key]}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: 'white', marginBottom: '10px', width: '100%', display: 'block' }} />
  );

  const sel = (key: string, options: {v:string,l:string}[]) => (
    <select value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: 'white', marginBottom: '10px', width: '100%', display: 'block' }}>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );

  if (!authenticated) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '16px', border: '1px solid #d4af37', textAlign: 'center' }}>
        <h1 style={{ color: '#d4af37', marginBottom: '20px' }}>🔐 Admin Panel - RE Global</h1>
        <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d4af37', background: '#0a0a0a', color: 'white', marginBottom: '16px', width: '200px', display: 'block', margin: '0 auto 16px' }} />
        <button onClick={handleLogin}
          style={{ background: '#d4af37', color: 'black', padding: '12px 32px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }}>
          دخول
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px', color: 'white' }}>
      <h1 style={{ color: '#d4af37', marginBottom: '30px' }}>🏠 Admin Dashboard - RE Global</h1>

      <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '16px', border: '1px solid #d4af37', marginBottom: '30px' }}>
        <h2 style={{ color: '#d4af37', marginBottom: '16px' }}>إضافة عقار جديد</h2>

        {inp('عنوان العقار', 'title')}
        {inp('السعر', 'price')}

        <label style={{ color: '#d4af37', fontSize: '13px' }}>العملة:</label>
        {sel('currency', [{v:'Pi',l:'Pi'},{v:'USD',l:'USD'},{v:'EGP',l:'EGP'}])}

        {inp('الموقع', 'location')}

        <label style={{ color: '#d4af37', fontSize: '13px' }}>نوع الإعلان:</label>
        {sel('type', [{v:'buy',l:'شراء'},{v:'rent',l:'إيجار'},{v:'hotel',l:'فندق'},{v:'tokenized',l:'Tokenized'},{v:'abroad',l:'خارج البلاد'},{v:'offplan',l:'أوف بلان'}])}

        <label style={{ color: '#d4af37', fontSize: '13px' }}>نوع العقار:</label>
        {sel('propertyType', [{v:'apartment',l:'شقة'},{v:'villa',l:'فيلا'},{v:'penthouse',l:'بنتهاوس'},{v:'commercial',l:'تجاري'}])}

        <label style={{ color: '#d4af37', fontSize: '13px' }}>الحالة:</label>
        {sel('status', [{v:'available',l:'متاح'},{v:'sold',l:'مباع'},{v:'under_construction',l:'تحت الإنشاء'}])}

        {inp('غرف النوم', 'bedrooms')}
        {inp('الحمامات', 'bathrooms')}
        {inp('المساحة (م²)', 'area')}

        <textarea placeholder="وصف العقار..." value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={4}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: 'white', marginBottom: '10px', width: '100%', display: 'block', resize: 'vertical' }} />

        {inp('رابط الصورة الرئيسية', 'image')}
        {inp('روابط صور إضافية (مفصولة بفاصلة)', 'images')}

        <input placeholder="VR Tour URL (اختياري)" value={form.vrUrl}
          onChange={e => setForm({ ...form, vrUrl: e.target.value })}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d4af37', background: '#111', color: 'white', marginBottom: '10px', width: '100%', display: 'block' }} />

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#d4af37', display: 'block', marginBottom: '8px' }}>المرافق:</label>
          {[['pool','مسبح'],['gym','جيم'],['parking','موقف'],['security','أمن']].map(([k,l]) => (
            <label key={k} style={{ color: 'white', marginRight: '16px', cursor: 'pointer' }}>
              <input type="checkbox" checked={(form.amenities as any)[k]}
                onChange={e => setForm({ ...form, amenities: { ...form.amenities, [k]: e.target.checked } })}
                style={{ marginRight: '4px' }} />
              {l}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '10px' }}>
          <input type="checkbox" checked={form.tokenized} onChange={e => setForm({ ...form, tokenized: e.target.checked })} />
          <label style={{ color: '#d4af37' }}>✅ Tokenized عقار مرمز</label>
        </div>

        <button onClick={handleAdd}
          style={{ background: '#d4af37', color: 'black', padding: '14px 40px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          إضافة العقار
        </button>
      </div>

      <h2 style={{ color: '#d4af37', marginBottom: '16px' }}>العقارات ({properties.length})</h2>
      {properties.map(p => (
        <div key={p.id} style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', border: '1px solid #333', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#d4af37', fontWeight: 'bold' }}>{p.title}</p>
            <p style={{ color: '#999', fontSize: '14px' }}>{p.location} — {p.price} {p.currency} — {p.type}</p>
            <p style={{ color: '#777', fontSize: '12px' }}>{p.propertyType} | {p.status}</p>
            {p.tokenized && <span style={{ color: '#00ff88', fontSize: '12px' }}>✅ Tokenized </span>}
            {p.vrUrl && <span style={{ color: '#4488ff', fontSize: '12px' }}>🥽 VR </span>}
          </div>
          <button onClick={() => handleDelete(p.id)}
            style={{ background: '#ff4444', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
}
