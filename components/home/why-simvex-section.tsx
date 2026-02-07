import { Lightbulb, Target, Users } from 'lucide-react';

const benefits = [
  {
    icon: Target,
    title: '목표 지향적 학습',
    description: '각 모델별 학습 목표와 핵심 포인트를 명확히 제시',
  },
  {
    icon: Users,
    title: '학습자 중심 설계',
    description: '공대생의 실제 학습 패턴을 분석해 최적화된 UX 제공',
  },
  {
    icon: Lightbulb,
    title: '심화 학습 유도',
    description: 'AI가 관련 개념과 심화 주제를 자연스럽게 연결',
  },
];

const testimonials = [
  {
    emoji: '🎓',
    role: '기계공학 전공생',
    quote: '"시험 전에 엔진 구조 한번 돌려보니까 확 이해됐어요"',
  },
  {
    emoji: '🔧',
    role: '자동차공학 학습자',
    quote: '"서스펜션 작동 원리를 처음으로 제대로 이해했습니다"',
  },
  {
    emoji: '📚',
    role: '공학 교수님',
    quote: '"수업 자료로 활용하니 학생들 집중도가 확 올랐어요"',
  },
];

export function WhySimvexSection() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              교과서로는 부족했던
              <br />
              <span className="text-primary">공학 학습의 새로운 방식</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              2D 도면과 텍스트만으로는 복잡한 기계 구조를 이해하기 어렵습니다.
              SIMVEX는 실제 CAD 모델을 기반으로 한 3D 시각화와 AI 어시스턴트를
              통해 직관적이고 효과적인 학습 경험을 제공합니다.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 lg:p-10">
            <div className="space-y-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.role}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <div className="text-4xl">{testimonial.emoji}</div>
                  <div>
                    <div className="font-medium text-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.quote}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
