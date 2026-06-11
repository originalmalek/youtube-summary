import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('forgotPassword');

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
