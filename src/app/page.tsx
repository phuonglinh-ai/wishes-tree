import { Wish } from '@/types/wish';
import HomeClient from './HomeClient';

// ISR: revalidate every 60 seconds — so after admin approves a wish,
// the tree updates within a minute without a full redeploy.
export const revalidate = 60;

async function getWishes(): Promise<Wish[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/wishes`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.wishes ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const wishes = await getWishes();
  return <HomeClient initialWishes={wishes} />;
}
