// Vietnamese profanity filter
// Step 1: Normalize accented Vietnamese text to plain ASCII before matching
// Step 2: Check against word list

const NORMALIZE_MAP: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
  â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
  đ: 'd',
};

export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((c) => NORMALIZE_MAP[c] ?? c)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

// Basic list of inappropriate words (normalized, no diacritics)
const BANNED_WORDS: string[] = [
  'dit', 'lon', 'buoi', 'cu', 'dai', 'du ma', 'me may', 'fuck', 'shit', 'bitch', 'asshole', 'sex',
];

export function containsProfanity(text: string): boolean {
  const normalized = normalizeVietnamese(text);
  // Check each banned word as a word boundary
  return BANNED_WORDS.some((word) => {
    const regex = new RegExp(`(^|\\s|[^a-z])${word}($|\\s|[^a-z])`, 'i');
    return regex.test(normalized);
  });
}
