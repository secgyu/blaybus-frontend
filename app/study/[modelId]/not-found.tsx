import Link from 'next/link';

import { AlertCircle } from 'lucide-react';

import { Header } from '@/components/header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            모델을 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground mb-6">
            요청하신 3D 모델이 존재하지 않습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
