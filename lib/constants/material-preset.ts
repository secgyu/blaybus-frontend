import type { MaterialType } from '@/types/api/model';

export interface MaterialPresetConfig {
  color: string;
  metalness: number;
  roughness: number;
  vertexColors?: boolean;
  disableBaseColorMap?: boolean;
}

export const MATERIAL_PRESET: Record<MaterialType, MaterialPresetConfig> = {
  METAL_STEEL_POLISHED: {
    color: '#D0D6DB',
    metalness: 1.0,
    roughness: 0.18,
    vertexColors: false,
  },
  METAL_STEEL_MACHINED: {
    color: '#B7BCC2',
    metalness: 1.0,
    roughness: 0.35,
    vertexColors: false,
  },
  METAL_STEEL_BRUSHED: {
    color: '#AEB6BD',
    metalness: 1.0,
    roughness: 0.45,
    vertexColors: false,
  },
  METAL_STEEL_HEAT_TREATED: {
    color: '#8C939A',
    metalness: 1.0,
    roughness: 0.4,
    vertexColors: false,
  },
  METAL_CAST_ROUGH: {
    color: '#6F767D',
    metalness: 1.0,
    roughness: 0.7,
    vertexColors: false,
  },
  METAL_ALUMINUM_MACHINED: {
    color: '#D6DADF',
    metalness: 1.0,
    roughness: 0.48,
    vertexColors: false,
  },
  METAL_OILY: {
    color: '#AAB1B8',
    metalness: 1.0,
    roughness: 0.22,
    vertexColors: false,
  },

  PLASTIC_MATTE: {
    color: '#1B1B1B',
    metalness: 0.0,
    roughness: 0.88,
    vertexColors: false,
  },
  PLASTIC_SATIN_1: {
    color: '#8C2626',
    metalness: 0.0,
    roughness: 0.7,
    vertexColors: false,
  },
  PLASTIC_SATIN_2: {
    color: '#8C92AC',
    metalness: 0.0,
    roughness: 0.7,
    vertexColors: false,
  },
  PLASTIC_SATIN: {
    color: '#202020',
    metalness: 0.0,
    roughness: 0.7,
    vertexColors: false,
  },
  PLASTIC_GLOSS: {
    color: '#2A2A2A',
    metalness: 0.0,
    roughness: 0.35,
    vertexColors: false,
  },
};
