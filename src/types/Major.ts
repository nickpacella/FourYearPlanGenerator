// src/types/Major.ts

export interface Major {
    name: string;
    coreCourses: string[];
    electiveCourses: string[];
    requiredCredits: number;
    description?: string;
  }
  