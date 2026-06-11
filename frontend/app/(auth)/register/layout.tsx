import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('register');

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
