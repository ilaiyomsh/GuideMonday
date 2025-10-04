import { useCallback } from 'react';
import mondaySdk from 'monday-sdk-js';
import { DEFAULT_GUIDE_TEMPLATE } from "../defaultGuideTemplate";

const monday = mondaySdk();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useMondayApi = () => {

    const fetchGuide = useCallback(async () => {
        try {
            const res = await monday.storage.instance.getItem('guideData');
            const storedString = res?.data?.value;
            if (storedString && storedString.trim() !== '') {
                return JSON.parse(storedString);
            }
            // If no data, return null to show setup screen
            return null;
        } catch (error) {
            console.error("Failed to fetch guide data:", error);
            // On failure, return null to show setup screen
            return null;
        }
    }, []);

    const saveGuide = useCallback(async (guideToSave) => {
        if (!guideToSave) return false;
        
        const jsonString = JSON.stringify(guideToSave);
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 500;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                await monday.storage.instance.setItem('guideData', jsonString);
                await sleep(RETRY_DELAY_MS);
                const verifyRes = await monday.storage.instance.getItem('guideData');
                if (verifyRes.data.value) {
                    monday.execute('notice', { message: 'המדריך נשמר בהצלחה', type: 'success' });
                    return true;
                }
            } catch (error) {
                console.error(`Save attempt ${attempt} failed:`, error);
            }
        }

        monday.execute('notice', { message: 'שגיאה קריטית בשמירת המדריך.', type: 'error' });
        return false;
    }, []);

    return { fetchGuide, saveGuide };
};
