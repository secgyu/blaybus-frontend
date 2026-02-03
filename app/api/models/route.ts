import { NextResponse } from 'next/server';

import DroneData from '@/mocks/model/Dron.json';
import LeafSpringData from '@/mocks/model/Leaf_Spring.json';
import MachineViceData from '@/mocks/model/Machine_Vice.json';
import RobotArmData from '@/mocks/model/Robot_Arm.json';
import RobotGripperData from '@/mocks/model/Robot_Gripper.json';
import SuspensionData from '@/mocks/model/Suspension.json';
import V4EngineData from '@/mocks/model/V4_Engine.json';
import type { ModelData } from '@/types/model';

export const mockDataMap: Record<string, ModelData> = {
  v4_engine: V4EngineData as ModelData,
  suspension: SuspensionData as ModelData,
  drone: DroneData as ModelData,
  robot_arm: RobotArmData as ModelData,
  robot_gripper: RobotGripperData as ModelData,
  leaf_spring: LeafSpringData as ModelData,
  machine_vice: MachineViceData as ModelData,
};

interface ModelSummary {
  modelId: string;
  title: string;
  thumbnailUrl: string;
  overview: string;
}

export async function GET() {
  const models: ModelSummary[] = Object.values(mockDataMap).map((data) => ({
    modelId: data.model.modelId,
    title: data.model.title,
    thumbnailUrl: data.model.thumbnailUrl,
    overview: data.model.overview,
  }));

  return NextResponse.json(models);
}
