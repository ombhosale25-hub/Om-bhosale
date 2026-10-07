import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderUp,
  FileCode,
  FileText,
  Clock,
  LogOut,
  Loader2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  initAuth,
} from '../services/firebaseAuth';
import {
  uploadPreviewToDrive,
  listAppDriveFiles,
  DriveFileItem,
} from '../services/googleDrive';
import { generateReportHtml } from '../utils/generateReportHtml';
import { AppItem, DayScreenTime } from '../types';
import { formatMinutes } from '../utils/initialData';

interface GoogleDriveSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalMinutes: number;
  dailyLimitHours: number;
  breaksCount: number;
  focusScore: number;
  apps: AppItem[];
  weeklyData: DayScreenTime[];
}

export const GoogleDriveSaveModal: React.FC<GoogleDriveSaveModalProps> = ({
  isOpen,
  onClose,
  totalMinutes,
  dailyLimitHours,
  breaksCount,
  focusScore,
  apps,
  weeklyData,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fileFormat, setFileFormat] = useState<'html' | 'text' | 'json'>('html');
  const [savedFile, setSavedFile] = useState<DriveFileItem | null>(null);
  const [previousFiles, setPreviousFiles] = useState<DriveFileItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showConfirmPrompt, setShowConfirmPrompt] = useState<boolean>(false);

  // Initialize Auth on mount
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadDriveFiles();
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  const loadDriveFiles = async () => {
    try {
      const files = await listAppDriveFiles();
      setPreviousFiles(files);
    } catch {
      // Ignored
    }
  };

  if (!isOpen) return null;

  const defaultFileName = `ScreenTime_Report_${new Date().toISOString().slice(0, 10)}.${
    fileFormat === 'html' ? 'html' : fileFormat === 'text' ? 'txt' : 'json'
  }`;

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMessage('');
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadDriveFiles();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      setErrorMessage(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setSavedFile(null);
  };

  const handleInitiateSave = () => {
    setErrorMessage('');
    setShowConfirmPrompt(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmPrompt(false);
    setIsSaving(true);
    setErrorMessage('');

    try {
      let content = '';
      let mimeType: 'text/html' | 'text/plain' | 'application/json' = 'text/html';

      if (fileFormat === 'html') {
        content = generateReportHtml(
          totalMinutes,
          dailyLimitHours,
          breaksCount,
          focusScore,
          apps,
          weeklyData
        );
        mimeType = 'text/html';
      } else if (fileFormat === 'text') {
        content = `SMART SCREEN TIME REPORT\nGenerated: ${new Date().toLocaleString()}\n\nToday's Screen Time: ${formatMinutes(
          totalMinutes
        )}\nDaily Goal: ${dailyLimitHours} hours\nBreaks: ${breaksCount}\nFocus Score: ${focusScore}%\n\nApplications:\n${apps
          .map((a) => `- ${a.name}: ${formatMinutes(a.minutesUsed)}`)
          .join('\n')}\n\nWeekly Trend:\n${weeklyData
          .map((w) => `- ${w.fullDay}: ${w.hours}h ${w.minutes}m`)
          .join('\n')}`;
        mimeType = 'text/plain';
      } else {
        content = JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            metrics: {
              totalMinutes,
              dailyLimitHours,
              breaksCount,
              focusScore,
            },
            apps,
            weeklyData,
          },
          null,
          2
        );
        mimeType = 'application/json';
      }

      const file = await uploadPreviewToDrive(defaultFileName, content, mimeType);
      setSavedFile(file);
      await loadDriveFiles();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save to Google Drive';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Save Preview to Google Drive</h2>
              <p className="text-xs text-slate-500">
                Archive your habit reports & interactive preview directly to Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Authentication if not signed in */}
        {!token ? (
          <div className="text-center py-6 px-4">
            <div className="max-w-md mx-auto">
              <p className="text-sm text-slate-600 mb-6">
                To save reports directly to your Google Drive, connect with your Google account. With your permission, the app will store files in your Drive.
              </p>

              {/* Official Google Material Sign-In Button */}
              <button
                type="button"
                disabled={isSigningIn}
                onClick={handleSignIn}
                className="gsi-material-button mx-auto flex items-center justify-center gap-3 px-5 py-3 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 shadow-xs text-slate-700 font-semibold text-sm transition-all cursor-pointer hover:shadow-md disabled:opacity-50"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>
                  {isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}
                </span>
              </button>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Signed In - Save Configuration */
          <div className="space-y-4">
            {/* Account Info bar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2.5">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{user?.displayName || 'Google Account'}</p>
                  <p className="text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                title="Disconnect Google Drive"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>

            {/* Choose File Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Report Format:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFileFormat('html')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    fileFormat === 'html'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-indigo-600 mb-1" />
                  <p className="text-xs font-bold text-slate-800">Visual HTML</p>
                  <p className="text-[10px] text-slate-500">Standalone interactive webpage preview</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFileFormat('text')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    fileFormat === 'text'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600 mb-1" />
                  <p className="text-xs font-bold text-slate-800">Plain Text</p>
                  <p className="text-[10px] text-slate-500">Simple bullet-point summary</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFileFormat('json')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    fileFormat === 'json'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-amber-600 mb-1" />
                  <p className="text-xs font-bold text-slate-800">JSON Data</p>
                  <p className="text-[10px] text-slate-500">Structured data backup</p>
                </button>
              </div>
            </div>

            {/* File info card */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">File target: </span>
                <span className="font-mono font-semibold text-slate-700">{defaultFileName}</span>
              </div>
              <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                Today's Stats ({formatMinutes(totalMinutes)})
              </span>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success notification */}
            {savedFile && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Successfully saved <strong>{savedFile.name}</strong> to Google Drive!
                  </span>
                </div>
                {savedFile.webViewLink && (
                  <a
                    href={savedFile.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 underline ml-2"
                  >
                    <span>View in Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleInitiateSave}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Google Drive...</span>
                  </>
                ) : (
                  <>
                    <FolderUp className="w-4 h-4" />
                    <span>Upload & Save Preview to Google Drive</span>
                  </>
                )}
              </button>
            </div>

            {/* Previous Uploads list */}
            {previousFiles.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recent Reports in Google Drive:</span>
                </h4>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {previousFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-medium text-slate-700 truncate max-w-[280px]">
                        {f.name}
                      </span>
                      {f.webViewLink ? (
                        <a
                          href={f.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Saved</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog before mutating Drive data */}
      {showConfirmPrompt && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70"
          onClick={() => setShowConfirmPrompt(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Confirm Save to Google Drive
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to save <strong>{defaultFileName}</strong> ({fileFormat.toUpperCase()}) to your personal Google Drive account?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmPrompt(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Yes, Save File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
