import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'am', name: 'Amharic' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'ka', name: 'Georgian' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ha', name: 'Hausa' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ig', name: 'Igbo' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'ko', name: 'Korean' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'ms', name: 'Malay' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'ne', name: 'Nepali' },
  { code: 'no', name: 'Norwegian' },
  { code: 'om', name: 'Oromo' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'so', name: 'Somali' },
  { code: 'es', name: 'Spanish' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' },
];

interface LanguageSelectorProps {
  current: string;
  onChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ current, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-zinc-200/50 hover:border-primary/30 transition-all group"
      >
        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:text-primary group-hover:bg-blue-50 transition-colors">
          <Globe size={12} />
        </div>
        <span className="text-sm font-semibold text-zinc-700">{current}</span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden animate-scale-in origin-top z-50">
          <div className="p-3 border-b border-zinc-50 bg-zinc-50/50 sticky top-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search languages..." 
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-primary/50 text-zinc-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { onChange(lang.name); setIsOpen(false); setSearchTerm(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-zinc-50 transition-colors ${current === lang.name ? 'bg-blue-50/50 text-primary font-medium' : 'text-zinc-600'}`}
                >
                  {lang.name}
                  {current === lang.name && <Check size={14} />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-zinc-400 text-center">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};