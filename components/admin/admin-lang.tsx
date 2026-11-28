'use client';

import { createContext, useContext } from 'react';
import type { AdminLang } from '@/lib/admin-i18n';

// The admin page provides the language; the menus and the section bars read it. Outside the admin page it is Arabic.
export const AdminLangContext = createContext<{ lang: AdminLang; setLang: (l: AdminLang) => void }>({ lang: 'ar', setLang: () => undefined });
export const useAdminLang = () => useContext(AdminLangContext);
