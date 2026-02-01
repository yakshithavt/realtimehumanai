import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Bot,
  Image,
  FileText,
  Monitor,
  TrendingUp,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  type: string;
  score: number;
  highlights: string[];
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  query: string;
  message: string;
}

interface SearchFilters {
  role?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  language?: string;
}

export function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const { toast } = useToast();

  const resultsPerPage = 20;

  useEffect(() => {
    loadPopularSearches();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        loadSuggestions(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const loadPopularSearches = async () => {
    try {
      const response = await fetch('/api/search/popular');
      const data = await response.json();
      if (data.success) {
        setPopularSearches(data.popular_searches);
      }
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  };

  const loadSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const performSearch = useCallback(async (page: number = 0) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchFilters: any = {};
      
      if (filters.role) searchFilters.role = filters.role;
      if (filters.type) searchFilters.type = filters.type;
      if (filters.language) searchFilters.language = filters.language;
      if (filters.dateFrom) searchFilters.date_from = filters.dateFrom.toISOString();
      if (filters.dateTo) searchFilters.date_to = filters.dateTo.toISOString();

      const response = await fetch('/api/search/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          filters: searchFilters,
          limit: resultsPerPage,
          offset: page * resultsPerPage
        })
      });

      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setTotal(data.total);
        setCurrentPage(page);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: error instanceof Error ? error.message : 'Failed to perform search',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [query, filters, toast]);

  const handleSearch = () => {
    performSearch(0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(0);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getRoleIcon = (role: string) => {
    return role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'screen': return <Monitor className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights.length) return text;
    
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold">Advanced Search</h2>
          <p className="text-muted-foreground">Search through your chat history with powerful filters</p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 h-12 text-lg"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Search Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {!query && popularSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSuggestionClick(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {total} results for "{query}"
            </h3>
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {Math.ceil(total / resultsPerPage)}
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getRoleIcon(result.role)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.role === 'user' ? 'default' : 'secondary'}>
                          {result.role}
                        </Badge>
                        {result.type !== 'text' && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTypeIcon(result.type)}
                            {result.type}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(result.timestamp)}
                        </span>
                        <Badge variant="outline" className="ml-auto">
                          Score: {result.score.toFixed(1)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm">
                        {highlightText(result.content, result.highlights)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > resultsPerPage && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => performSearch(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(total / resultsPerPage)) }, (_, i) => {
                  const page = i;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => performSearch(page)}
                    >
                      {page + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                disabled={currentPage >= Math.ceil(total / resultsPerPage) - 1}
                onClick={() => performSearch(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {query && !loading && results.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
