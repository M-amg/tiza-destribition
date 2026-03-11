export interface ContactMessageRequest {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  status: string;
  message: string;
}