'use client';

import React from 'react';
import { useState } from 'react';

import { Globe, Plus, Send } from 'lucide-react';

interface SearchBarProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export function SearchBar({ onSubmit, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-6"
    >
      <div className="glass-panel p-2 flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <Plus className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="무엇이 궁금하신가요?"
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        <button
          type="button"
          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          Web에서 물어보기
        </button>

        <button
          type="submit"
          disabled={!query.trim() || disabled}
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
