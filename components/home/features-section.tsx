import { Cpu, Layers, Zap } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: '3D 분해/조립 뷰',
    description:
      '실제 CAD 소프트웨어처럼 엔지니어링 부품을 분해하고 조립하세요. 슬라이더로 분해 정도를 조절하며 내부 구조를 관찰할 수 있습니다.',
    items: [
      '분해 슬라이더로 단계별 관찰',
      '360도 자유로운 회전',
      '줌인/줌아웃으로 세부 관찰',
    ],
  },
  {
    icon: Cpu,
    title: 'AI 학습 어시스턴트',
    description:
      '현재 보고 있는 모델의 맥락을 이해하는 AI가 궁금한 점을 바로 해결해드립니다. 부품의 역할, 재료, 작동 원리를 질문하세요.',
    items: ['모델별 맞춤 응답', '한국어 자연어 대화', '심화 학습 유도'],
  },
  {
    icon: Zap,
    title: '인터랙티브 학습',
    description:
      '클릭하고, 회전하고, 확대하며 직접 체험하는 능동적 학습. 수동적인 교재 학습을 넘어 직접 조작하며 이해도를 높이세요.',
    items: [
      '부품 클릭으로 상세 정보',
      '하이라이트 시각 효과',
      '직관적인 UI/UX',
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            왜 <span className="text-primary">SIMVEX</span>인가요?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            교과서만으로는 이해하기 어려웠던 복잡한 기계 구조를
            <br className="hidden md:block" />
            3D 인터랙션과 AI의 도움으로 직관적으로 학습할 수 있습니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-panel p-8 hover:border-primary/50 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
