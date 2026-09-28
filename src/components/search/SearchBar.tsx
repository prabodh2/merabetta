'use client';

/**
 * SearchBar — Premium Search Experience Component
 *
 * Features:
 *   - Unified search input with discoverable category pills
 *   - Real-time autocomplete suggestions from /api/search/suggestions
 *   - Search scope selection (search by city, pincode, services, etc.)
 *   - Debounced API calls for smooth typing experience
 *   - Keyboard navigation (arrow keys, enter, escape)
 *   - Responsive design with smooth animations
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Building2,
  MapPin,
  MapPinned,
  Stethoscope,
  Bed,
  Sparkles,
  ChevronRight,
  Hash,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface SuggestionItem {
  text: string;
  category: string;
  icon: string;
  field: string;
}

interface SearchScope {
  id: string;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  fields: string[];
  placeholder: string;
}

interface SearchBarProps {
  /** Fires when the user submits a search (enter key or click) */
  onSearch: (params: { query: string; field?: string }) => void;
  /** Initial query value */
  initialQuery?: string;
  /** Show loading indicator in the search button */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ── Search Scopes ────────────────────────────────────────────────────────────

const SEARCH_SCOPES: SearchScope[] = [
  {
    id: 'all',
    label: 'Smart Search',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    emoji: '🔍',
    fields: [],
    placeholder: 'Search old age homes, city, pincode or services...',
  },
  {
    id: 'homeName',
    label: 'Old Age Home',
    icon: <Building2 className="w-3.5 h-3.5" />,
    emoji: '🏠',
    fields: ['homeName'],
    placeholder: 'Search by old age home name...',
  },
  {
    id: 'pinCode',
    label: 'Pincode',
    icon: <Hash className="w-3.5 h-3.5" />,
    emoji: '📮',
    fields: ['pinCode'],
    placeholder: 'Enter a 6-digit pincode...',
  },
  {
    id: 'city',
    label: 'City / Area',
    icon: <MapPin className="w-3.5 h-3.5" />,
    emoji: '🏙️',
    fields: ['city', 'address'],
    placeholder: 'Search by city, town, or area...',
  },
  {
    id: 'state',
    label: 'State',
    icon: <MapPinned className="w-3.5 h-3.5" />,
    emoji: '🗺️',
    fields: ['state'],
    placeholder: 'Search by state...',
  },
  {
    id: 'services',
    label: 'Care Services',
    icon: <Stethoscope className="w-3.5 h-3.5" />,
    emoji: '🩺',
    fields: ['services', 'medical'],
    placeholder: 'Search nursing care, physiotherapy...',
  },
  {
    id: 'livingType',
    label: 'Living Type',
    icon: <Bed className="w-3.5 h-3.5" />,
    emoji: '🛏️',
    fields: ['services'],
    placeholder: 'Assisted living, independent, dementia care...',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({
  onSearch,
  initialQuery = '',
  isLoading = false,
  className = '',
}: SearchBarProps) {
  // State
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [activeScope, setActiveScope] = useState<SearchScope>(SEARCH_SCOPES[0]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [showScopes, setShowScopes] = useState(true);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Autocomplete Fetch ───────────────────────────────────────────────────

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsFetchingSuggestions(true);
    try {
      const res = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(q)}&limit=8`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch {
      // Silently fail — suggestions are not critical
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  // Debounced fetch on query change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      setShowScopes(false);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query.trim());
      }, 250);
    } else {
      setSuggestions([]);
      setShowScopes(true);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // ── Click Outside → Close ────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Event Handlers ─────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    onSearch({
      query: trimmed,
      field: activeScope.id === 'all' ? undefined : activeScope.id,
    });
    setIsOpen(false);
    inputRef.current?.blur();
  }, [query, activeScope, onSearch]);

  const handleSuggestionClick = useCallback(
    (suggestion: SuggestionItem) => {
      setQuery(suggestion.text);
      onSearch({
        query: suggestion.text,
        field: suggestion.field,
      });
      setIsOpen(false);
      setSuggestions([]);
    },
    [onSearch]
  );

  const handleScopeClick = useCallback((scope: SearchScope) => {
    setActiveScope(scope);
    setQuery('');
    setSuggestions([]);
    setShowScopes(false);
    inputRef.current?.focus();
  }, []);

  const handleClearScope = useCallback(() => {
    setActiveScope(SEARCH_SCOPES[0]);
    setQuery('');
    setSuggestions([]);
    setShowScopes(true);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = suggestions.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIdx((prev) =>
          prev < totalItems - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIdx((prev) =>
          prev > 0 ? prev - 1 : totalItems - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIdx >= 0 && highlightedIdx < totalItems) {
          handleSuggestionClick(suggestions[highlightedIdx]);
        } else {
          handleSubmit();
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [suggestions, highlightedIdx, handleSuggestionClick, handleSubmit]
  );

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightedIdx(-1);
  }, [suggestions]);

  // ── Render ──────────────────────────────────────────────────────────────

  const isScoped = activeScope.id !== 'all';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* ── Search Input Bar ── */}
      <div
        className={`flex items-center gap-2 bg-white border-2 rounded-2xl px-4 py-3 transition-all duration-200 ${
          isOpen
            ? 'border-[#E86A33] shadow-lg shadow-orange-100/50 ring-4 ring-[#E86A33]/10'
            : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
        }`}
      >
        {/* Search Icon */}
        <Search
          className={`w-5 h-5 shrink-0 transition-colors ${
            isOpen ? 'text-[#E86A33]' : 'text-slate-400'
          }`}
        />

        {/* Active Scope Chip */}
        {isScoped && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#E86A33] shrink-0">
            {activeScope.icon}
            <span>{activeScope.label}</span>
            <button
              type="button"
              onClick={handleClearScope}
              className="ml-0.5 text-orange-400 hover:text-orange-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={activeScope.placeholder}
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear / Loading */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowScopes(true);
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E86A33] hover:bg-[#D85820] active:scale-95 text-white text-xs font-black shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            animation: 'searchDropdownIn 200ms ease-out forwards',
          }}
        >
          {/* Scopes Discovery Panel — shown when input is empty */}
          {showScopes && (
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-1">
                Search by
              </p>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SCOPES.filter((s) => s.id !== 'all').map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => handleScopeClick(scope)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      activeScope.id === scope.id
                        ? 'bg-[#E86A33] text-white border-[#E86A33] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-200 hover:text-[#E86A33]'
                    }`}
                  >
                    <span className="text-base leading-none">
                      {scope.emoji}
                    </span>
                    <span>{scope.label}</span>
                  </button>
                ))}
              </div>

              {/* Popular Searches */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-1 mb-2">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Mumbai',
                    'Pune',
                    'Thane',
                    'Assisted Living',
                    'Nursing Care',
                    'Dementia Care',
                  ].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        onSearch({ query: term });
                        setIsOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-[#E86A33] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suggestions List — shown when typing */}
          {!showScopes && suggestions.length > 0 && (
            <div className="py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-4 pb-2">
                Suggestions
              </p>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={`${suggestion.field}-${suggestion.text}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                    idx === highlightedIdx
                      ? 'bg-orange-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg leading-none shrink-0">
                    {suggestion.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {highlightText(suggestion.text, query)}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {suggestion.category}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {!showScopes && isFetchingSuggestions && suggestions.length === 0 && (
            <div className="p-6 flex items-center justify-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-[#E86A33] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">
                Searching...
              </span>
            </div>
          )}

          {/* No Results */}
          {!showScopes &&
            !isFetchingSuggestions &&
            suggestions.length === 0 &&
            query.length >= 2 && (
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-slate-500">
                  No suggestions found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Press Enter to search anyway
                </p>
              </div>
            )}
        </div>
      )}

      {/* Dropdown animation keyframes */}
      <style jsx>{`
        @keyframes searchDropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// ── Utilities ──────────────────────────────────────────────────────────────────

/**
 * Highlight matching portions of suggestion text.
 * Returns JSX with bold matched segments.
 */
function highlightText(
  text: string,
  query: string
): React.ReactNode {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) return text;

  return (
    <>
      {text.substring(0, idx)}
      <span className="text-[#E86A33] font-bold">
        {text.substring(idx, idx + query.length)}
      </span>
      {text.substring(idx + query.length)}
    </>
  );
}
