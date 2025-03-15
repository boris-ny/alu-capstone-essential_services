import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;
export const mockPrisma = mockDeep<PrismaClient>();
