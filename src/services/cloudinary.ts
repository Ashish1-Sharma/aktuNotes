import axios from 'axios';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key';

interface UploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

interface UploadError {
  error: {
    message: string;
  };
}

/**
 * Upload a PDF file to Cloudinary
 * @param file - The PDF file to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with the upload response
 */
export const uploadPDFToCloudinary = async (
  file: File,
  folder: string = 'notes'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('resource_type', 'raw');
  
  // Add timestamp for signature if needed
  const timestamp = Math.round(new Date().getTime() / 1000);
  formData.append('timestamp', timestamp.toString());
  
  try {
    const response = await axios.post<UploadResponse>(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${progress}%`);
          }
        },
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as UploadError;
      throw new Error(errorData.error?.message || 'Upload failed');
    }
    throw new Error('Network error during upload');
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @returns Promise with the deletion response
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // Note: For security, deletion should ideally be done via a backend server
    // This is a simplified version - in production, use a server-side function
    await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/destroy`,
      {
        public_id: publicId,
        api_key: CLOUDINARY_API_KEY,
      }
    );
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Find the upload folder index
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' (excluding version number)
    const relevantParts = pathParts.slice(uploadIndex + 1);
    // Remove version number if present (starts with 'v' followed by digits)
    if (relevantParts[0]?.match(/^v\d+$/)) {
      relevantParts.shift();
    }
    
    // Remove file extension from the last part
    const lastPart = relevantParts[relevantParts.length - 1];
    if (lastPart) {
      const dotIndex = lastPart.lastIndexOf('.');
      if (dotIndex !== -1) {
        relevantParts[relevantParts.length - 1] = lastPart.substring(0, dotIndex);
      }
    }
    
    return relevantParts.join('/');
  } catch {
    return null;
  }
};

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export const validatePDFFile = (
  file: File,
  maxSizeMB: number = 50
): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

/**
 * Get file size in readable format
 * @param bytes - File size in bytes
 * @returns Formatted string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
