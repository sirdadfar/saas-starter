import './globals.css';
import {Providers} from '@/components/providers';
export const metadata={title:{default:'SaaS Starter',template:'%s · SaaS Starter'},description:'A production-minded Next.js and NestJS SaaS starter.',openGraph:{title:'SaaS Starter',description:'Build your SaaS on a solid foundation.',type:'website'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>}