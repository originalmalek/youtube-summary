import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('privacyPolicy');

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
