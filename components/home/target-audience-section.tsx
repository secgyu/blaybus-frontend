import { BookOpen, GraduationCap, Microscope, Wrench } from 'lucide-react';

const audiences = [
  {
    icon: GraduationCap,
    title: '공대생',
    description: '기계공학, 자동차공학 등 전공 학습에 필요한 부품 구조 이해',
  },
  {
    icon: Microscope,
    title: '과학기술 학습자',
    description: '기계 원리에 관심 있는 일반인과 자기주도 학습자',
  },
  {
    icon: Wrench,
    title: '현장 엔지니어',
    description: '신입 교육이나 복습이 필요한 실무 엔지니어',
  },
  {
    icon: BookOpen,
    title: '교육자',
    description: '공학 수업에 시각 자료가 필요한 교수님과 강사분',
  },
];

export function TargetAudienceSection() {
  return (
    <section className="relative py-20 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            누구를 위한 플랫폼인가요?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            SIMVEX는 공학과 과학기술 분야를 학습하는 모든 분들을 위해
            만들어졌습니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="glass-panel p-6 text-center hover:border-primary/50 transition-colors group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <audience.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {audience.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
