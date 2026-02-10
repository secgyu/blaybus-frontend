import Image from 'next/image';

export function WhySimvexSection() {
  return (
    <section className="relative w-full min-h-screen bg-[#070B14] overflow-hidden">
      <div className="absolute top-[10%] right-[-100px] w-[400px] h-[400px] md:w-[550px] md:h-[550px] lg:w-[700px] lg:h-[700px] pointer-events-none select-none">
        <Image
          src="/root/image4.png"
          alt="3D Gears"
          fill
          className="object-contain opacity-20"
          style={{ transform: 'rotate(-24.52deg)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 max-w-[900px]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2563EB] tracking-tight mb-6">
          WHY SIMVEX?
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-[#fff] mb-8 md:mb-12 leading-relaxed">
          SIMVEX는 공학 구조물을{' '}
          <strong>3D로 탐색 · 분해 · 질문하며 이해하는 학습 도구</strong>{' '}
          입니다.
        </p>

        <div className="text-xs sm:text-sm md:text-base text-[#fff] leading-relaxed">
          <p>
            공학 학습자들의 상당수가 &lsquo;2D 판서·교재 중심 수업으로는 공학
            구조물의
            <br /> 원리 이해가 어렵다&rsquo;고 답하였습니다.
            <br />
            이러한 문제를 3D 시뮬레이션 뷰어와 AI가 결합된 학습 도구 SIMVEX가
            <br />
            해결해줍니다.
          </p>
        </div>
      </div>
    </section>
  );
}
