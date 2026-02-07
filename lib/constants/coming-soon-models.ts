export interface ComingSoonItem {
  id: string;
  title: string;
  description: string;
}

export const BIO_ENGINEERING_MODELS: ComingSoonItem[] = [
  {
    id: 'bio_dna_helix',
    title: 'DNA 이중나선',
    description:
      'DNA 이중나선 구조의 3D 모델을 통해 뉴클레오타이드 배열과 수소결합 원리를 학습합니다.',
  },
  {
    id: 'bio_cell_structure',
    title: '세포 구조',
    description:
      '동물 세포의 내부 구조를 3D로 분해하여 소기관의 역할과 상호작용을 학습합니다.',
  },
  {
    id: 'bio_protein_folding',
    title: '단백질 접힘',
    description:
      '단백질의 1·2·3·4차 구조와 접힘 과정을 3D 시각화로 학습합니다.',
  },
];

export const BIOMEDICAL_MODELS: ComingSoonItem[] = [
  {
    id: 'med_artificial_joint',
    title: '인공관절',
    description: '인공 슬관절의 구조와 삽입 메커니즘을 3D 분해도로 학습합니다.',
  },
  {
    id: 'med_prosthetic_hand',
    title: '의수 (보철물)',
    description: '전동 의수의 링크 메커니즘과 센서 배치를 3D로 학습합니다.',
  },
  {
    id: 'med_stent',
    title: '혈관 스텐트',
    description:
      '자가팽창형 혈관 스텐트의 구조와 혈관 내 확장 원리를 학습합니다.',
  },
];
