import React from 'react';
import { useAssistant } from '../providers/AssistantProvider';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { X } from 'lucide-react';

export const GlobalAssistantDrawer: React.FC = () => {
    const { isAssistantOpen, closeAssistant } = useAssistant();

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-500 ${
                isAssistantOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div className="absolute top-8 right-8 z-50">
                <button 
                    onClick={closeAssistant}
                    className="p-3 rounded-full bg-black/50 hover:bg-primary/20 text-white/70 hover:text-white border border-white/10 hover:border-primary/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(5,217,232,0.4)]"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            {/* Full-screen Jarvis Core via AssistantPage */}
            <div className="w-full h-full">
                <AssistantPage isGlobalMode={true} />
            </div>
        </div>
    );
};
