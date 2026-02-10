const features = [
  {
    number: 1,
    title: '눈으로 이해하는 구조 학습',
    description: '3D 오브젝트 회전 / 줌 / 분해 / 조립',
  },
  {
    number: 2,
    title: '이론과 구조를 연결하는 AI',
    description: '현재 보고 있는 구조물 및 부품 기준으로 AI 설명',
  },
  {
    number: 3,
    title: '학습을 남기는 기록',
    description: '메모 / AI / 뷰 상태 자동 저장',
  },
];

function FeaturesLogo() {
  return (
    <svg
      width="104"
      height="86"
      viewBox="0 0 104 86"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M45.6201 40.8843V83.6162L83.4437 63.6939L82.8662 21.8281L45.6201 40.8843Z"
        stroke="url(#feat_paint0)"
        strokeWidth="2.88729"
      />
      <path
        d="M83.4425 63.694L38.112 41.6672M1.44336 23.8494L28.5839 10.2791M1.44336 23.8494V58.7856M1.44336 23.8494L38.112 41.6672M45.9077 1.61719L83.4425 20.6733M45.9077 1.61719V34.2436M45.9077 1.61719L28.5839 10.2791M28.5839 10.2791V61.6729L1.44336 75.8207V58.7856M1.44336 58.7856L38.112 41.6672M1.44336 58.7856L45.9077 80.4403"
        stroke="url(#feat_paint1)"
        strokeWidth="2.88729"
      />
      <g filter="url(#feat_filter0)">
        <circle cx="83.1561" cy="21.536" r="2.5985" fill="#FAFAFA" />
      </g>
      <path
        d="M1.44336 24.4258L28.5839 10.8555V62.2493L1.44336 76.3971V59.362M1.44336 24.4258V59.362M1.44336 24.4258L38.112 42.2436L1.44336 59.362"
        stroke="url(#feat_paint2)"
        strokeWidth="2.88729"
      />
      <defs>
        <filter
          id="feat_filter0"
          x="63.2339"
          y="1.61373"
          width="39.8448"
          height="39.8428"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="5.77459"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="5.77459" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.231373 0 0 0 0 0.509804 0 0 0 0 0.964706 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <linearGradient
          id="feat_paint0"
          x1="114.915"
          y1="76.6867"
          x2="45.9088"
          y2="43.1941"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient
          id="feat_paint1"
          x1="23.6755"
          y1="5.6594"
          x2="23.6755"
          y2="112.201"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#3A80D7" />
        </linearGradient>
        <linearGradient
          id="feat_paint2"
          x1="31.1825"
          y1="61.0944"
          x2="1.44336"
          y2="26.7356"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#78B5FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative w-full min-h-screen bg-[#070B14] flex items-center justify-center overflow-hidden px-4 sm:px-6 py-20"
    >
      <div
        className="absolute w-[500px] h-[500px] lg:w-[977px] lg:h-[977px] rounded-full pointer-events-none"
        style={{
          left: 'calc(50% - 50%)',
          top: 'calc(50% - 50%)',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(96, 165, 250, 0.1) 0%, rgba(59, 130, 246, 0.1) 25.41%, rgba(37, 99, 235, 0.1) 49.61%, rgba(29, 78, 216, 0.1) 71.61%, rgba(30, 64, 175, 0.1) 85.8%, rgba(4, 10, 46, 0.1) 100%)',
          filter: 'blur(50px)',
        }}
      />

      <div
        className="absolute rounded-full border border-[#1E40AF]/30 pointer-events-none hidden lg:block"
        style={{
          width: '1622px',
          height: '1622px',
          left: '-287px',
          top: 'calc(50% - 1622px/2)',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 xl:gap-24">
        <div className="flex flex-col items-center shrink-0">
          <div className="mb-6 lg:mb-8">
            <FeaturesLogo />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#FAFAFA] text-center lg:whitespace-nowrap">
            우리가 제공하는{' '}
            <span className="text-[#2563EB]">3가지 핵심 가치</span>
          </h2>
        </div>

        <div className="flex flex-col gap-10 lg:gap-20 lg:ml-20 xl:ml-40 2xl:ml-72">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className="flex flex-col justify-center items-start w-[300px] sm:w-[360px] lg:w-[440px] rounded-[20px] px-6 sm:px-10 py-6 sm:py-8"
              style={{
                background: 'rgba(250, 250, 250, 0.1)',
                backdropFilter: 'blur(5px)',
                marginLeft: index === 0 ? '0px' : index === 1 ? '40px' : '0px',
              }}
            >
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#FAFAFA] mb-2">
                {feature.number}. {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#B8B8B8]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
