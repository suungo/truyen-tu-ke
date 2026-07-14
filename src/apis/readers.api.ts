import { apiClient } from ".";

export interface Reader {
  id: number;
  username: string;
  email?: string;
  createdAt: string;
}

const READER_KEY = "reader_id";
const READER_NAME_KEY = "reader_name";
const READER_EMAIL_KEY = "reader_email";

export const setGuestReader = () => {
  localStorage.setItem(READER_KEY, "guest");
  localStorage.setItem(READER_NAME_KEY, "Khách");
  localStorage.removeItem(READER_EMAIL_KEY);
};

export const setLoggedInReader = (reader: { id: number; username: string; email: string }) => {
  localStorage.setItem(READER_KEY, String(reader.id));
  localStorage.setItem(READER_NAME_KEY, reader.username);
  localStorage.setItem(READER_EMAIL_KEY, reader.email);
};

export const clearReaderSession = () => {
  localStorage.removeItem(READER_KEY);
  localStorage.removeItem(READER_NAME_KEY);
  localStorage.removeItem(READER_EMAIL_KEY);
};

export const getReaderId = (): string | null =>
  localStorage.getItem(READER_KEY);

export const getReaderName = (): string | null =>
  localStorage.getItem(READER_NAME_KEY);

export const getReaderEmail = (): string | null =>
  localStorage.getItem(READER_EMAIL_KEY);

export const isReaderLoggedIn = (): boolean => {
  const id = getReaderId();
  return !!id && id !== "guest";
};

// Auth API calls
export const sendOtp = async (email: string): Promise<any> => {
  const res = await apiClient.post("/readers/send-otp", { email });
  return res.data;
};

export const registerReader = async (username: string, email: string, otp: string): Promise<Reader> => {
  const res = await apiClient.post("/readers/register", { username, email, otp });
  const reader = res.data.data;
  setLoggedInReader(reader);
  return reader;
};

export const loginReader = async (email: string): Promise<Reader> => {
  const res = await apiClient.post("/readers/login", { email });
  const reader = res.data.data;
  setLoggedInReader(reader);
  return reader;
};

export const getReaderStats = async (id: number): Promise<{
  reader: Reader;
  totalRegistered: number;
  totalApproved: number;
  totalRejected: number;
}> => {
  const res = await apiClient.get(`/readers/${id}/stats`);
  return res.data.data;
};

export const updateReaderInfo = async (
  id: number,
  username: string,
  email: string
): Promise<Reader> => {
  const res = await apiClient.put(`/readers/${id}`, { username, email });
  const reader = res.data.data;
  setLoggedInReader(reader);
  return reader;
};
