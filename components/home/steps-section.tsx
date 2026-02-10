import Image from 'next/image';

const steps = [
  { label: 'STEP 1. 구조물을 선택 하세요' },
  { label: 'STEP 2. 궁금한 내용은 AI에게 바로 물어보세요' },
  { label: 'STEP 3. 직접 돌리고, 확대하고, 분해하세요' },
  { label: 'STEP 4. 이해한 내용을 기록으로 남기세요' },
];

export function StepsSection() {
  return (
    <section className="relative w-full bg-[#070B14] overflow-hidden">
      <div className="text-center pt-12 sm:pt-16 md:pt-20 relative z-10 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold text-[#FAFAFA] mb-3 md:mb-4 leading-tight">
          이렇게 학습하세요
        </h2>
        <p className="text-base sm:text-lg md:text-[22px] text-[#B8B8B8] mb-8 sm:mb-12 md:mb-[65px]">
          3D 탐색과 AI 질문으로 완성하는 학습 과정
        </p>
      </div>

      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[732px]">
        <div className="absolute inset-0">
          <Image
            src="/root/image3.png"
            alt="SIMVEX 학습 과정"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 95%' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(4, 10, 46, 0.1)',
              backdropFilter: 'blur(3.5px)',
              WebkitBackdropFilter: 'blur(3.5px)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 px-4 lg:hidden">
          {steps.map((step) => (
            <div
              key={step.label}
              className="flex items-center justify-center rounded-full px-6 sm:px-10 py-3"
              style={{
                height: '46px',
                background: 'rgba(89, 89, 89, 0.2)',
              }}
            >
              <span className="text-xs sm:text-sm text-[#FAFAFA] whitespace-nowrap">
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden lg:block relative z-10 w-full h-full">
          <div
            className="absolute flex items-center rounded-full px-10 py-3"
            style={{
              height: '46px',
              left: 'calc(50% - 505px)',
              top: '120px',
              background: 'rgba(89, 89, 89, 0.2)',
            }}
          >
            <span className="text-sm text-[#FAFAFA] whitespace-nowrap">
              STEP 1. 구조물을 선택 하세요
            </span>
          </div>

          <div
            className="absolute flex items-center rounded-full px-10 py-3"
            style={{
              height: '46px',
              left: 'calc(50% - 505px)',
              top: '433px',
              background: 'rgba(89, 89, 89, 0.2)',
            }}
          >
            <span className="text-sm text-[#FAFAFA] whitespace-nowrap">
              STEP 2. 궁금한 내용은 AI에게 바로 물어보세요
            </span>
          </div>

          <div
            className="absolute flex items-center rounded-full px-10 py-3"
            style={{
              height: '46px',
              left: 'calc(50% + 200px)',
              top: '80px',
              background: 'rgba(89, 89, 89, 0.2)',
            }}
          >
            <span className="text-sm text-[#FAFAFA] whitespace-nowrap">
              STEP 3. 직접 돌리고, 확대하고, 분해하세요
            </span>
          </div>

          <div
            className="absolute flex items-center rounded-full px-10 py-3"
            style={{
              height: '46px',
              left: 'calc(50% + 250px)',
              top: '406px',
              background: 'rgba(89, 89, 89, 0.2)',
            }}
          >
            <span className="text-sm text-[#FAFAFA] whitespace-nowrap">
              STEP 4. 이해한 내용을 기록으로 남기세요
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
