import React, { useState } from 'react';
import { 
  Delete, 
  CornerDownLeft, 
  ArrowUp, 
  X, 
  Sparkles,
  Space,
  Trash2,
  ChevronDown
} from 'lucide-react';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (newValue: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function VirtualKeyboard({
  isOpen,
  onClose,
  value,
  onChange,
  onSend,
  disabled = false,
}: VirtualKeyboardProps) {
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [mode, setMode] = useState<'alpha' | 'symbols'>('alpha');

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    if (disabled) return;
    onChange(value + char);
    if (isShift && !isCaps) {
      setIsShift(false);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  const handleSpace = () => {
    if (disabled) return;
    onChange(value + ' ');
  };

  const handleQuickAdd = (phrase: string) => {
    if (disabled) return;
    if (value.trim().length > 0 && !value.endsWith(' ')) {
      onChange(value + ' ' + phrase);
    } else {
      onChange(value + phrase);
    }
  };

  const alphaRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '?'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', ',']
  ];

  const shiftAlphaRows = [
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ':', '/']
  ];

  const symbolRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['@', '#', '$', '%', '&', '*', '-', '+', '(', ')'],
    ['!', '"', "'", ':', ';', '/', '?', '=', '<', '>'],
    ['~', '`', '|', '\\', '{', '}', '[', ']', '_']
  ];

  const currentRows = mode === 'symbols' 
    ? symbolRows 
    : (isShift || isCaps ? shiftAlphaRows : alphaRows);

  const quickChips = [
    'Threat Status',
    'Isolate Node',
    'Ransomware Scan',
    'C2 Network Health',
    'Hardware EDR Rover',
    'Lock Port 445',
    'System Anomaly'
  ];

  return (
    <div className="w-full bg-zinc-950/95 border-t-2 border-primary/40 p-2 sm:p-3 select-none backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-40 animate-in slide-in-from-bottom duration-200">
      {/* Top Header Bar with Quick Chips & Close */}
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-white/10 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          <span className="text-[10px] font-mono font-bold text-primary tracking-wider uppercase shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Quick:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAdd(chip)}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-surface hover:bg-primary/20 text-white/80 hover:text-primary border border-white/10 hover:border-primary/40 shrink-0 transition-colors cursor-pointer active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 text-xs font-mono transition-colors shrink-0 cursor-pointer"
          title="Hide On-Screen Keyboard"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">HIDE</span>
        </button>
      </div>

      {/* Keys Container */}
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
        {/* Row 1, 2, 3 */}
        {currentRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {/* Shift key on bottom alpha row */}
            {rowIdx === currentRows.length - 1 && mode === 'alpha' && (
              <button
                type="button"
                onClick={() => {
                  if (isShift) {
                    setIsCaps(!isCaps);
                    setIsShift(false);
                  } else {
                    setIsShift(true);
                  }
                }}
                className={`flex-1 max-w-[70px] min-h-[38px] sm:min-h-[44px] rounded flex items-center justify-center font-mono font-bold text-xs border transition-all active:scale-95 cursor-pointer ${
                  isCaps 
                    ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(5,217,232,0.6)]' 
                    : isShift 
                    ? 'bg-primary/30 text-primary border-primary' 
                    : 'bg-zinc-900/90 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
                title={isCaps ? 'Caps Lock ON' : isShift ? 'Shift Active' : 'Shift'}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}

            {row.map((keyChar) => (
              <button
                key={keyChar}
                type="button"
                onClick={() => handleKeyPress(keyChar)}
                className="flex-1 min-w-[28px] max-w-[62px] min-h-[38px] sm:min-h-[44px] rounded bg-zinc-900/90 hover:bg-primary/20 text-white font-mono font-bold text-sm sm:text-base border border-white/10 hover:border-primary/50 hover:text-primary transition-all active:scale-90 active:bg-primary active:text-black flex items-center justify-center shadow-sm cursor-pointer"
              >
                {keyChar}
              </button>
            ))}

            {/* Backspace on bottom row */}
            {rowIdx === currentRows.length - 1 && (
              <button
                type="button"
                onClick={handleBackspace}
                className="flex-1 max-w-[70px] min-h-[38px] sm:min-h-[44px] rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 font-mono font-bold text-xs border border-rose-500/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Bottom Function Bar (Mode switch, Spacebar, Clear, Send) */}
        <div className="flex justify-center gap-1 sm:gap-1.5 w-full pt-0.5">
          {/* Symbols Toggle */}
          <button
            type="button"
            onClick={() => setMode(mode === 'alpha' ? 'symbols' : 'alpha')}
            className="w-16 sm:w-20 min-h-[38px] sm:min-h-[44px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono font-bold text-xs border border-white/15 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            {mode === 'alpha' ? '?123' : 'ABC'}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="w-12 sm:w-16 min-h-[38px] sm:min-h-[44px] rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-xs border border-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Clear all text"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Spacebar */}
          <button
            type="button"
            onClick={handleSpace}
            className="flex-1 max-w-[340px] min-h-[38px] sm:min-h-[44px] rounded bg-zinc-900/90 hover:bg-primary/20 text-zinc-400 hover:text-primary font-mono text-xs sm:text-sm border border-white/10 hover:border-primary/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Space className="w-4 h-4 opacity-50" />
            <span className="tracking-widest uppercase">SPACE</span>
          </button>

          {/* Submit / Ask AI Button */}
          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="w-24 sm:w-32 min-h-[38px] sm:min-h-[44px] rounded bg-primary hover:bg-primary/90 text-black font-mono font-bold text-xs sm:text-sm border border-primary transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(5,217,232,0.4)]"
          >
            <span>ASK AI</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VirtualKeyboard;
