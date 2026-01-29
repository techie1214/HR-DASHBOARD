// Interfaces for API data structures that match the backend API
// These are used by the API services to ensure type safety

export interface StaffMember {
  id: string;
  user_id: number;
  employee_id: string;
  designation: string;
  department: string;
  branch_id: number;
  joining_date: string;
  employment_type: string;
  reporting_manager_id?: number;
  work_mode: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  tax_identification_number?: string;
  base_salary: number;
  pay_grade?: string;
  pension_insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  date_of_birth: string;
  gender: string;
  current_address_id?: number;
  permanent_address_id?: number;
  primary_skills?: string;
  work_email: string;
  personal_email: string;
  phone_number: string;
  marital_status: string;
  highest_qualification?: string;
  university_school?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffRequest {
  user_id: number;
  employee_id: string;
  designation: string;
  department: string;
  branch_id: number;
  joining_date: string;
  employment_type: string;
  reporting_manager_id?: number;
  work_mode: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  tax_identification_number?: string;
  base_salary: number;
  pay_grade?: string;
  pension_insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  date_of_birth: string;
  gender: string;
  current_address_id?: number;
  permanent_address_id?: number;
  primary_skills?: string;
  work_email: string;
  personal_email: string;
  phone_number: string;
  marital_status: string;
  highest_qualification?: string;
  university_school?: string;
}

export interface UpdateStaffRequest {
  employee_id?: string;
  designation?: string;
  department?: string;
  branch_id?: number;
  employment_type?: string;
  reporting_manager_id?: number;
  work_mode?: string;
  bank_name?: string;
  base_salary?: number;
  pay_grade?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  primary_skills?: string;
  work_email?: string;
  phone_number?: string;
  marital_status?: string;
  status?: string;
}

// Define interfaces for staff invitation
export interface StaffInvitation {
  id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  roleId: string;
  branchId: string;
  departmentId: string;
  status: 'pending' | 'accepted' | 'expired';
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffInvitationRequest {
  firstName: string;
  lastName: string;
  personalEmail: string;
  roleId: string;
  branchId: string;
  departmentId: string;
}