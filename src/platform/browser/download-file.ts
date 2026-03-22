export function downloadBlob(blob: Blob, fileName: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
}

export function downloadTextFile(text: string, fileName: string): void {
    downloadBlob(new Blob([text], {type: 'text/plain'}), fileName);
}
