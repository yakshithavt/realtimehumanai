import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bookmark, 
  BookmarkCheck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star,
  Tag,
  Folder,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  source_type: string;
  source_content?: string;
  tags: string[];
  category: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

interface NotesResponse {
  success: boolean;
  data: {
    notes?: Note[];
    total?: number;
    categories?: string[];
    [key: string]: any;
  };
  message: string;
}

export function NoteTaking() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    source_type: 'chat',
    tags: [] as string[],
    category: 'General'
  });
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
    loadCategories();
    loadStats();
  }, [selectedCategory, selectedTags, showFavoritesOnly]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }
      if (showFavoritesOnly) {
        params.append('is_favorite', 'true');
      }

      const response = await fetch(`/api/notes/list?${params}`);
      const data: NotesResponse = await response.json();
      
      if (data.success && data.data.notes) {
        setNotes(data.data.notes);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/notes/categories/list');
      const data: NotesResponse = await response.json();
      
      if (data.success && data.data.categories) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/notes/stats');
      const data: NotesResponse = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/notes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });

      const data: NotesResponse = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Note created successfully',
        });
        setShowCreateDialog(false);
        setNewNote({
          title: '',
          content: '',
          source_type: 'chat',
          tags: [],
          category: 'General'
        });
        loadNotes();
        loadStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create note',
        variant: 'destructive',
      });
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data: NotesResponse = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Note updated successfully',
        });
        setEditingNote(null);
        loadNotes();
        loadStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update note',
        variant: 'destructive',
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });

      const data: NotesResponse = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Note deleted successfully',
        });
        loadNotes();
        loadStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async (noteId: string, isFavorite: boolean) => {
    await updateNote(noteId, { is_favorite: !isFavorite });
  };

  const searchNotes = async () => {
    if (!searchQuery.trim()) {
      loadNotes();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/notes/search/${encodeURIComponent(searchQuery)}`);
      const data: NotesResponse = await response.json();
      
      if (data.success && data.data.notes) {
        setNotes(data.data.notes);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: string) => {
    try {
      const response = await fetch('/api/notes/categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });

      const data: NotesResponse = await response.json();
      
      if (data.success) {
        loadCategories();
        toast({
          title: 'Success',
          description: 'Category added successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'chat': return '💬';
      case 'vision': return '👁️';
      case 'screen': return '🖥️';
      case 'file': return '📁';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchNotes();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold">📝 Notes</h2>
          <p className="text-muted-foreground">Save and organize important AI responses</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total_notes}</div>
                <p className="text-sm text-muted-foreground">Total Notes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.favorite_notes}</div>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total_tags}</div>
                <p className="text-sm text-muted-foreground">Tags</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.recent_notes}</div>
                <p className="text-sm text-muted-foreground">This Week</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              {showFavoritesOnly ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
            </Button>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                  <DialogDescription>
                    Save an important AI response for future reference
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Note content..."
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newNote.source_type} onValueChange={(value) => setNewNote(prev => ({ ...prev, source_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Source type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="vision">Vision</SelectItem>
                        <SelectItem value="screen">Screen</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newNote.category} onValueChange={(value) => setNewNote(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createNote}>
                      Create Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                Start saving important AI responses to build your knowledge base
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{note.title}</h3>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getSourceIcon(note.source_type)}
                          {note.source_type}
                        </Badge>
                        <Badge variant="secondary">{note.category}</Badge>
                        {note.is_favorite && (
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-3">
                        {note.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(note.updated_at)}
                        </span>
                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {note.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-xs">+{note.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(note.id, note.is_favorite)}
                      >
                        {note.is_favorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNote(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Update your note details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={editingNote.title}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
              <Textarea
                placeholder="Note content..."
                value={editingNote.content}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                rows={6}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={editingNote.category} onValueChange={(value) => setEditingNote(prev => prev ? { ...prev, category: value } : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={editingNote.is_favorite}
                    onCheckedChange={(checked) => setEditingNote(prev => prev ? { ...prev, is_favorite: checked as boolean } : null)}
                  />
                  <label className="text-sm">Mark as favorite</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button onClick={() => editingNote && updateNote(editingNote.id, editingNote)}>
                  Update Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
