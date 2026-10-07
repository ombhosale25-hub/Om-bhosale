import { getAccessToken } from './firebaseAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}

/**
 * Upload an HTML or Text preview report directly to Google Drive
 */
export async function uploadPreviewToDrive(
  fileName: string,
  content: string,
  mimeType: 'text/html' | 'text/plain' | 'application/json' = 'text/html'
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token missing. Please sign in with Google first.');
  }

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Digital wellness and screen time report exported from Smart Screen Time Manager',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error: ${response.status} ${errorText}`);
  }

  const result: DriveFileItem = await response.json();
  return result;
}

/**
 * List files created by this app in Google Drive
 */
export async function listAppDriveFiles(): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink,createdTime)&orderBy=createdTime desc',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.files || [];
}
