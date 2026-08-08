#!/usr/bin/env python3
#!/usr/bin/env python3
"""Run from the repo root: python3 3-patch-page-and-home.py"""

# --- app/page.tsx ---
path1 = "app/page.tsx"
with open(path1, encoding="utf-8") as f:
    c = f.read()

old_import = """const RETokenPage = dynamic(() => import('@/components/pages/re-token-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
export default function App() {"""
new_import = """const RETokenPage = dynamic(() => import('@/components/pages/re-token-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const InspectionsPage = dynamic(() => import('@/components/pages/inspections-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
export default function App() {"""

old_case = """      case 'contracts':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <ContractsPage language={language} onBack={() => handlePageChange('home')} />
          </div>
        );
      case 'retoken':"""
new_case = """      case 'contracts':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <ContractsPage language={language} onBack={() => handlePageChange('home')} />
          </div>
        );
      case 'inspections':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <InspectionsPage language={language} onBack={() => handlePageChange('home')} onNavigate={handlePageChange} />
          </div>
        );
      case 'retoken':"""

assert old_import in c, "app/page.tsx: import anchor not found — file may differ, edit manually"
assert old_case in c, "app/page.tsx: case anchor not found — file may differ, edit manually"
c = c.replace(old_import, new_import, 1)
c = c.replace(old_case, new_case, 1)
with open(path1, "w", encoding="utf-8") as f:
    f.write(c)
print("✔ app/page.tsx patched")

# --- components/pages/home-page.tsx ---
path2 = "components/pages/home-page.tsx"
with open(path2, encoding="utf-8") as f:
    c2 = f.read()

old_imp = "import { Building2, Home, Hotel, TrendingUp, Globe, FileText, MapPin, Users, Zap, BarChart3, ShoppingCart, Video, Bot, Glasses, ScrollText, ShieldCheck, Languages, Coins } from 'lucide-react';"
new_imp = "import { Building2, Home, Hotel, TrendingUp, Globe, FileText, MapPin, Users, Zap, BarChart3, ShoppingCart, Video, Bot, Glasses, ScrollText, ShieldCheck, Languages, Coins, ScanLine } from 'lucide-react';"

old_cat = """  { id: 'contracts', titleEn: 'Contracts', titleAr: 'العقود', icon: ScrollText },
  { id: 'retoken', titleEn: 'RE Token', titleAr: 'عملة RE', icon: Coins },"""
new_cat = """  { id: 'contracts', titleEn: 'Contracts', titleAr: 'العقود', icon: ScrollText },
  { id: 'inspections', titleEn: 'Inspect', titleAr: 'الفحص', icon: ScanLine },
  { id: 'retoken', titleEn: 'RE Token', titleAr: 'عملة RE', icon: Coins },"""

assert old_imp in c2, "home-page.tsx: import anchor not found — file may differ, edit manually"
assert old_cat in c2, "home-page.tsx: category anchor not found — file may differ, edit manually"
c2 = c2.replace(old_imp, new_imp, 1)
c2 = c2.replace(old_cat, new_cat, 1)
with open(path2, "w", encoding="utf-8") as f:
    f.write(c2)
print("✔ components/pages/home-page.tsx patched")