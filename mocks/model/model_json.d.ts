import type { ModelData } from '@/types/model';

declare module '*/suspension.json' {
  const data: ModelData;
  export default data;
}

declare module '*/V4_Engine.json' {
  const data: ModelData;
  export default data;
}
