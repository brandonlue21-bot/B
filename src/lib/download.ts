/**
 * Saves a generated file for the user. Tries the Claude Artifact "downloads"
 * capability first (used when this app is embedded as a Claude Artifact,
 * where a plain <a download> link is inert); falls back to a normal browser
 * download everywhere else (self-hosted, local dev, etc).
 */
export async function downloadFile(content: string, filename: string, mime: string): Promise<void> {
  const claude = (window as unknown as { claude?: { use?: (name: string) => Promise<unknown> } })
    .claude;
  if (claude?.use) {
    try {
      const downloads = (await claude.use('downloads')) as
        | { save: (req: { filename: string; data: string }) => Promise<unknown> }
        | null;
      if (downloads) {
        await downloads.save({ filename, data: content });
        return;
      }
    } catch {
      // fall through to the normal browser download
    }
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
