export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  createdAt: Date;
  employeeCount: number;
}