import { MessageSquare, MousePointerClick, RotateCcw } from 'lucide-react';

const steps = [
  {
    icon: MousePointerClick,
    step: 'STEP 1',
    title: '모델 선택',
    description: (
      <>
        엔진, 로봇팔, 서스펜션 등<br />
        학습하고 싶은 모델을 선택하세요
      </>
    ),
    showConnector: true,
  },
  {
    icon: RotateCcw,
    step: 'STEP 2',
    title: '3D 탐색',
    description: (
      <>
        회전, 확대, 분해하며
        <br />
        구조를 직접 탐색하세요
      </>
    ),
    showConnector: true,
  },
  {
    icon: MessageSquare,
    step: 'STEP 3',
    title: 'AI와 학습',
    description: (
      <>
        궁금한 점을 AI에게 질문하고
        <br />
        심화 학습을 진행하세요
      </>
    ),
    showConnector: false,
  },
];

export function StepsSection() {
  return (
    <section className="relative py-20 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            이렇게 학습하세요
          </h2>
          <p className="text-muted-foreground">
            간단한 3단계로 기계 구조 학습을 시작할 수 있습니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              {item.showConnector && (
                <div
                  className="absolute top-8 left-1/2 w-full h-0.5 bg-linear-to-r from-transparent via-border to-transparent hidden md:block"
                  style={{ transform: 'translateX(50%)' }}
                />
              )}
              <div className="text-sm text-primary font-medium mb-2">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
