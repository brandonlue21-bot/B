import { useStore } from '../store';

export function StorageBanner() {
  const { storageMode, isFileSystemAccessSupported, filePromptDismissed, chooseFile, dismissFilePrompt } =
    useStore();

  if (!isFileSystemAccessSupported) return null;
  if (storageMode.kind !== 'browser') return null;
  if (filePromptDismissed) return null;

  return (
    <div className="mx-auto mt-4 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>
        Right now your grades are saved in this browser only. Save them to a file on your computer
        instead so you can back it up, move it, or open it from a different app.
      </span>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => void chooseFile()}
          className="rounded-md bg-amber-800 px-3 py-1.5 font-medium text-white hover:bg-amber-900"
        >
          Choose file…
        </button>
        <button
          onClick={dismissFilePrompt}
          className="rounded-md border border-amber-300 px-3 py-1.5 font-medium text-amber-800 hover:bg-amber-100"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

export function ReconnectScreen() {
  const { storageMode, reconnectFile, useBrowserStorageInstead } = useStore();

  if (storageMode.kind !== 'file-needs-permission') return null;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-slate-700">
        Reconnect to <span className="font-semibold">{storageMode.fileName}</span> to load your
        saved grades.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => void reconnectFile()}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Reconnect
        </button>
        <button
          onClick={useBrowserStorageInstead}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Use browser storage instead
        </button>
      </div>
    </div>
  );
}
