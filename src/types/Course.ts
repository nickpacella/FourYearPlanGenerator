// src/types/Course.ts

export interface Course {
    code: string;
    name: string;
    department: string;
    credits: number;
    prerequisites: string[];
    offeredSemesters: string[];
    categories: string[];
    description?: string;
  }
  