'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const SUPPORTED_LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Russian', label: 'Русский' },
  { code: 'Spanish', label: 'Español' },
  { code: 'French', label: 'Français' },
  { code: 'German', label: 'Deutsch' },
  { code: 'Italian', label: 'Italiano' },
  { code: 'Portuguese', label: 'Português' },
  { code: 'Chinese', label: '中文' },
  { code: 'Japanese', label: '日本語' },
  { code: 'Korean', label: '한국어' },
] as const;

interface LanguageSelectorProps {
  value: string;
  onValueChangeAction: (value: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onValueChangeAction, disabled }: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChangeAction} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}