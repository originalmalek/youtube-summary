import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('verifyEmail');

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
