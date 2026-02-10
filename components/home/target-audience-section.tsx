import Image from 'next/image';

const audiences = [
  {
    image: '/root/image5.png',
    alt: '공대생 아이콘',
    lines: ['전공 학습에 필요한', '부품 구조 이해가 필요한'],
    bold: '공대생',
  },
  {
    image: '/root/image6.png',
    alt: '학습자 아이콘',
    lines: ['복잡한 기계 원리를 직관적으로', '이해하고 싶은 '],
    bold: '관련 학습자',
  },
  {
    image: '/root/image7.png',
    alt: '사용자 아이콘',
    lines: ['기계 원리를 쉽게 이해하고 싶은'],
    bold: '사용자',
  },
];

export function TargetAudienceSection() {
  return (
    <section className="relative w-full min-h-screen bg-[#070B14] flex flex-col items-center justify-center px-4 sm:px-6 py-20">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#FAFAFA] mb-4 leading-tight">
          이런 분들을 위해 만들었어요
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-[#B8B8B8] leading-relaxed">
          SIMVEX는 공학과 과학기술 분야를 학습하는 모든 분들을{' '}
          <strong className="text-[#FAFAFA]">위해</strong> 만들어졌습니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {audiences.map((audience) => (
          <div
            key={audience.bold}
            className="flex flex-col items-center w-[280px] h-[340px] sm:w-[310px] sm:h-[370px] md:w-[340px] md:h-[400px] rounded-[20px] border border-[#1E40AF] px-6 sm:px-8 py-8 sm:py-12"
            style={{
              background: 'rgba(7, 11, 20, 0.2)',
              boxShadow:
                '-4px -4px 20px rgba(29, 78, 216, 0.3), 4px 4px 20px rgba(29, 78, 216, 0.3)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full px-6 sm:px-10 py-3 w-[240px] sm:w-[276px] h-[66px] sm:h-[76px] border border-white/10"
              style={{
                background: 'rgba(89, 89, 89, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <p className="text-xs sm:text-sm text-[#FAFAFA] text-center leading-snug">
                {audience.lines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < audience.lines.length - 1 && <br />}
                  </span>
                ))}{' '}
                <strong className="font-bold">{audience.bold}</strong>
              </p>
            </div>

            <div className="relative flex-1 flex items-center justify-center">
              <div
                className="absolute w-[120px] h-[120px] sm:w-[145px] sm:h-[145px] rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(50% 50% at 50% 50%, rgba(96, 165, 250, 0.5) 0%, rgba(59, 130, 246, 0.5) 25.41%, rgba(37, 99, 235, 0.5) 49.61%, rgba(29, 78, 216, 0.5) 71.61%, rgba(30, 64, 175, 0.5) 85.8%, rgba(4, 10, 46, 0.5) 100%)',
                  filter: 'blur(50px)',
                }}
              />
              <div className="relative w-[110px] h-[110px] sm:w-[140px] sm:h-[140px]">
                <Image
                  src={audience.image}
                  alt={audience.alt}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
