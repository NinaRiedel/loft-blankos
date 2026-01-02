import { useState } from 'react';
import { parseSeating } from '../parseSeating.js';
import { SeatInfo } from '../types.js';

interface FileUploadProps {
  onSeatingDataParsed: (seatingData: SeatInfo[]) => void;
}

export function FileUpload({ onSeatingDataParsed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file');
      return;
    }

    setError(null);
    setFileName(file.name);

    try {
      // Try different encodings
      let content = '';
      
      // Try UTF-16 LE first
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-16le');
        content = decoder.decode(arrayBuffer);
        
        // Check if it looks valid
        if (!content.includes('Reihe') && !content.includes('Platz') && !content.includes('Sitzplatz')) {
          throw new Error('Invalid UTF-16 content');
        }
      } catch {
        // Fallback to UTF-8
        try {
          content = await file.text();
          if (!content.includes('Reihe') && !content.includes('Platz') && !content.includes('Sitzplatz')) {
            throw new Error('Invalid UTF-8 content');
          }
        } catch {
          // Last resort: read as binary and decode as latin1
          const arrayBuffer = await file.arrayBuffer();
          const decoder = new TextDecoder('latin1');
          content = decoder.decode(arrayBuffer);
        }
      }

      const seatingData = parseSeating(content);
      onSeatingDataParsed(seatingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse seating file');
      setFileName(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="upload-section">
      <h2>Optionsliste als Text-Export</h2>
      <label
        htmlFor="file-upload"
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          accept=".txt"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        {fileName ? (
          <span>✓ {fileName}</span>
        ) : (
          <span>Datei hochladen oder per Drag & Drop (.txt)</span>
        )}
      </label>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

