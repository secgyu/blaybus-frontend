import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-primary">모델을 불러오는 중...</span>
      </div>
    </div>
  );
}
