import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export interface StaffDocument {
  id: number;
  staff_id: number;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: string;
  expiry_date?: string | null;
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: {
    document: StaffDocument;
  };
}

export interface GetDocumentsResponse {
  success: boolean;
  message: string;
  data: {
    documents: StaffDocument[];
    total: number;
  };
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Upload staff document
 */
export const uploadStaffDocument = async (
  staffId: string,
  documentType: string,
  file: File
): Promise<UploadDocumentResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found',
        data: { document: {} as StaffDocument }
      };
    }

    const formData = new FormData();
    formData.append('documents', file);
    formData.append('document_type', documentType);

    const response = await axios.post(
      `${API_ENDPOINT}/staff-documents/staff/${staffId}/documents`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Upload document error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to upload document',
      data: { document: {} as StaffDocument }
    };
  }
};

/**
 * Get staff documents
 */
export const getStaffDocuments = async (staffId: string): Promise<GetDocumentsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found',
        data: { documents: [], total: 0 }
      };
    }

    const response = await axios.get(
      `${API_ENDPOINT}/staff-documents/staff/${staffId}/documents`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Get documents error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to retrieve documents',
      data: { documents: [], total: 0 }
    };
  }
};

/**
 * Delete staff document
 */
export const deleteStaffDocument = async (documentId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found'
      };
    }

    const response = await axios.delete(
      `${API_ENDPOINT}/staff-documents/staff/documents/${documentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Delete document error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete document'
    };
  }
};

/**
 * Get document URL for viewing/downloading
 */
export const getDocumentUrl = (filePath: string): string => {
  if (!filePath) return '';
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  return `${API_ENDPOINT}/${cleanPath}`;
};

/**
 * Download staff document
 */
export const downloadStaffDocument = async (document: StaffDocument): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(
      `${API_ENDPOINT}${document.file_path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', document.document_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Download document error:', error);
    throw error;
  }
};
