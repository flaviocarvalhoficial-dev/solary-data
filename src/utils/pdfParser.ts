import * as pdfjs from 'pdfjs-dist';

// Setting up the worker for pdfjs
// In Vite, it's easier to use the CDN for the worker if not using a specific loader
// But we can try to point it to the local node_modules path if needed.
// For browser usage with Vite:
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ParsedBillData {
    uc: string;
    competency: string; // MM/YYYY
    totalValue: number;
    consumption: number; // kWh
    injectedEnergy: number; // kWh
    streetLighting: number; // R$
    confidence: number;
}

export const parseFaturaPDF = async (file: File): Promise<ParsedBillData> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    // Join all text items into one string for regex analysis
    const fullText = textContent.items.map((item: any) => item.str).join(' ');

    console.log('PDF Text extracted:', fullText);

    // REGEX STRATEGY (Specifically for Equatorial Pará / Similar Layouts)

    // 1. UC / INSTALAÇÃO / CONTA CONTRATO
    const ucMatch = fullText.match(/INSTALAÇÃO:\s*(\d+)/i)
        || fullText.match(/Instalação:\s*(\d+)/i)
        || fullText.match(/CONTA CONTRATO:\s*(\d+)/i)
        || fullText.match(/Nº DA INSTALAÇÃO:\s*(\d+)/i);
    const uc = ucMatch ? ucMatch[1] : 'N/A';

    // 2. COMPETENCY
    const compMatch = fullText.match(/(\d{2}\/\d{4})/);
    const competency = compMatch ? compMatch[1] : 'N/A';

    // 3. TOTAL VALUE
    const valueMatch = fullText.match(/Total a Pagar\s*R\$\s*([\d,.]+)/i)
        || fullText.match(/VALOR A PAGAR\s*R\$\s*([\d,.]+)/i)
        || fullText.match(/R\$\s*([\d,.]+)/);
    const totalValueText = valueMatch ? valueMatch[1] : '0';
    const totalValue = parseFloat(totalValueText.replace(/\./g, '').replace(',', '.'));

    // 4. CONSUMO COMPENSADO (kWh)
    const consMatch = fullText.match(/Consumo Compensado\s*\(kWh\)\s*(\d+)/i)
        || fullText.match(/Energia Compensada\s*\(kWh\)\s*(\d+)/i);
    const consumption = consMatch ? parseInt(consMatch[1]) : 0;

    // 5. ENERGIA INJETADA (kWh)
    const injMatch = fullText.match(/Energia Ativa Injetada\s*\(kWh\)\s*(\d+)/i)
        || fullText.match(/Injetada\s*\(kWh\)\s*(\d+)/i);
    const injectedEnergy = injMatch ? parseInt(injMatch[1]) : 0;

    // 6. CIP / STREET LIGHTING (Taxa de Iluminação Pública)
    const cipMatch = fullText.match(/Cip-Ilum Pub-Pref Munic\s*R\$\s*([\d,.]+)/i)
        || fullText.match(/TAXA DE ILUMINAÇÃO PÚBLICA\s*R\$\s*([\d,.]+)/i)
        || fullText.match(/COSIP\s*R\$\s*([\d,.]+)/i);
    const streetLightingText = cipMatch ? cipMatch[1] : '0';
    const streetLighting = parseFloat(streetLightingText.replace(/\./g, '').replace(',', '.'));

    // Confidence Level Check
    const isUCOk = uc !== 'N/A';
    const isValOk = totalValue > 0;
    const isCIPOk = streetLighting > 0;
    const confidence = (isUCOk && isValOk && isCIPOk) ? 1.0 : (isUCOk && isValOk) ? 0.9 : 0.5;

    return {
        uc,
        competency,
        totalValue,
        consumption,
        injectedEnergy,
        streetLighting,
        confidence
    };
};
