import React from 'react';
import { Palette, Check } from 'lucide-react';

export type ThemeType = 'navy' | 'slate' | 'emerald' | 'amber' | 'zinc';

interface ThemeSettingsProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export default function ThemeSettings({ currentTheme, onThemeChange }: ThemeSettingsProps) {
  const themes = [
    { id: 'navy', label: 'Navy / Sky', primary: 'bg-[#1e3a8a]', accent: 'bg-[#0ea5e9]' },
    { id: 'slate', label: 'Slate / Indigo', primary: 'bg-[#1e293b]', accent: 'bg-[#6366f1]' },
    { id: 'emerald', label: 'Emerald / Teal', primary: 'bg-[#064e3b]', accent: 'bg-[#14b8a6]' },
    { id: 'amber', label: 'Amber / Warm', primary: 'bg-[#292524]', accent: 'bg-[#f59e0b]' },
    { id: 'zinc', label: 'Zinc / Neutral', primary: 'bg-[#27272a]', accent: 'bg-[#71717a]' },
  ] as const;

  return (
    <div className="p-4 border-t border-primary-900 bg-primary-950/40">
      <div className="flex items-center gap-2 text-slate-300 mb-3 text-xs font-bold uppercase tracking-wider">
        <Palette className="w-4 h-4" />
        <span>Theme</span>
      </div>
      <div className="flex flex-col gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`flex items-center justify-between p-2 rounded transition-colors ${
              currentTheme === theme.id ? 'bg-primary-900 shadow-inner' : 'hover:bg-primary-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                <div className={`w-3.5 h-3.5 rounded-full ${theme.primary} border border-primary-900`}></div>
                <div className={`w-3.5 h-3.5 rounded-full ${theme.accent} border border-primary-900 z-10`}></div>
              </div>
              <span className={`text-sm ${currentTheme === theme.id ? 'text-white font-medium' : 'text-slate-400'}`}>
                {theme.label}
              </span>
            </div>
            {currentTheme === theme.id && <Check className="w-3.5 h-3.5 text-accent-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}
