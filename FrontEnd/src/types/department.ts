export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  createdAt: Date;
  employeeCount: number;
}

export type CreateDepartmentInput = {
  name: string;
  description: string;
  managerId?: string;
};

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

// Validation functions
export const isDepartmentValid = (department: CreateDepartmentInput): boolean => {
  return (
    typeof department.name === 'string' &&
    department.name.trim().length > 0 &&
    typeof department.description === 'string' &&
    (!department.managerId || typeof department.managerId === 'string')
  );
};

// Type guard for Department
export const isDepartment = (obj: any): obj is Department => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    (obj.managerId === undefined || typeof obj.managerId === 'string') &&
    obj.createdAt instanceof Date &&
    typeof obj.employeeCount === 'number'
  );
};