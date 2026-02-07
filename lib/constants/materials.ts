export const MATERIAL_LABELS: Record<string, string> = {
  METAL_STEEL_POLISHED: '연마 강철 (Steel Polished)',
  METAL_STEEL_MACHINED: '기계가공 강철 (Steel Machined)',
  METAL_STEEL_BRUSHED: '브러시드 강철 (Steel Brushed)',
  METAL_STEEL_HEAT_TREATED: '열처리 강철 (Steel Heat Treated)',
  METAL_CAST_ROUGH: '주조 철 (Cast Rough)',
  METAL_ALUMINUM_MACHINED: '기계가공 알루미늄 (Aluminum Machined)',
  METAL_OILY: '유막 금속 (Oily Metal)',
  PLASTIC_MATTE: '무광 플라스틱 (Plastic Matte)',
  PLASTIC_SATIN: '새틴 플라스틱 (Plastic Satin)',
  PLASTIC_GLOSS: '유광 플라스틱 (Plastic Gloss)',
};

export function getMaterialLabel(type: string): string {
  return MATERIAL_LABELS[type] || type.replace(/_/g, ' ');
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
