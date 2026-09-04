import api from '@/lib/api';

export interface VoiceCommandResponse {
    intent: string;
    message: string;
    actionUrl?: string;
    success: boolean;
}

export const processVoiceCommand = async (text: string): Promise<VoiceCommandResponse> => {
    try {
        const response = await api.post('/voice/command', { text });
        return response.data;
    } catch (error) {
        console.error('Error processing voice command:', error);
        return {
            intent: 'ERROR',
            message: 'Failed to connect to the voice service.',
            success: false,
        };
    }
};
