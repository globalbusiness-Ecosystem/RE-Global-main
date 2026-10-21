import { stayFacts, type StayInfo } from '@/lib/stay-info';

// Check-in / check-out time and guest limit of a hotel or rental, when the admin filled them in.
export function StayFacts({ info, language }: { info: StayInfo; language: string }) {
  const facts = stayFacts(info, language);
  if (facts.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-white/10 p-3 text-sm text-gray-300">
      {facts.map((f) => <li key={f.icon}><span aria-hidden="true">{f.icon}</span> {f.text}</li>)}
    </ul>
  );
}
