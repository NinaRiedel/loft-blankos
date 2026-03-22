import {useEffect, useState} from 'react';

export function useTemplatePdf(): Uint8Array | null {
    const [templatePdfBytes, setTemplatePdfBytes] = useState<Uint8Array | null>(
        null,
    );

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}template.pdf`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Template not found');
                }

                return response.arrayBuffer();
            })
            .then(buffer => setTemplatePdfBytes(new Uint8Array(buffer)))
            .catch(() => setTemplatePdfBytes(null));
    }, []);

    return templatePdfBytes;
}
