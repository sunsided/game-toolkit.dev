/** Bytes as the Run button shows them: "6.8 MB", "940 kB". */
export function size(bytes: number): string {
	return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} kB`;
}
