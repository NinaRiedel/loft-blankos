import {useState} from 'react';
import {parseSeatingText, type SeatInfo} from './seat-info.js';
import {readSeatingFile} from './seating-file.js';

interface SeatingFileUploadProps {
    onSeatsParsed: (seats: SeatInfo[]) => void;
}

export function SeatingFileUpload({onSeatsParsed}: SeatingFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        try {
            const fileContent = await readSeatingFile(file);
            const seats = parseSeatingText(fileContent);

            setError(null);
            setFileName(file.name);
            onSeatsParsed(seats);
        } catch (nextError) {
            setError(
                nextError instanceof Error
                    ? nextError.message
                    : 'Failed to parse seating file',
            );
            setFileName(null);
        }
    };

    return (
        <div className="file-upload">
            <label
                htmlFor="seating-file-upload"
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDrop={event => {
                    event.preventDefault();
                    setIsDragging(false);

                    const file = event.dataTransfer.files[0];
                    if (file) {
                        void handleFile(file);
                    }
                }}
                onDragOver={event => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
            >
                <input
                    id="seating-file-upload"
                    type="file"
                    accept=".txt"
                    style={{display: 'none'}}
                    onChange={event => {
                        const file = event.target.files?.[0];
                        if (file) {
                            void handleFile(file);
                        }
                    }}
                />

                {fileName ? (
                    <span>✓ {fileName}</span>
                ) : (
                    <span>Datei auswählen oder per Drag & Drop (.txt)</span>
                )}
            </label>

            {error && <div className="error">{error}</div>}
        </div>
    );
}
