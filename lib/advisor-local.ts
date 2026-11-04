// Aladdin's built-in answers (legal guides, market overview, Pi payments, comparisons) are written in Arabic and English only.
// For the other five languages the question goes to the AI instead, which answers in the app's language.

/** True when the built-in answers exist in this language. Other languages must be answered by the AI. */
export function hasLocalAnswers(language: string | undefined): boolean {
  return language === undefined || language === 'ar' || language === 'en';
}
