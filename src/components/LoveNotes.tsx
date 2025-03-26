
import React, { useState, useEffect } from 'react';
import { Heart, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

const LoveNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Load notes from Supabase on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('love_notes')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Transform the data to match our Note interface
        const formattedNotes = data.map(note => ({
          id: note.id,
          content: note.content,
          createdAt: note.created_at
        }));
        
        setNotes(formattedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to load love notes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, []);
  
  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        // Insert the new note into Supabase
        const { data, error } = await supabase
          .from('love_notes')
          .insert({
            content: newNote
          })
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        // Add the new note to the local state
        const newNoteObj: Note = {
          id: data.id,
          content: data.content,
          createdAt: data.created_at
        };
        
        setNotes([newNoteObj, ...notes]);
        setNewNote('');
        toast.success('Love note saved');
      } catch (error) {
        console.error('Error adding note:', error);
        toast.error('Failed to save love note');
      }
    }
  };
  
  const handleDeleteNote = async (id: string) => {
    try {
      // Delete the note from Supabase
      const { error } = await supabase
        .from('love_notes')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Remove the note from local state
      setNotes(notes.filter(note => note.id !== id));
      toast.success('Love note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete love note');
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-center mb-8">
        <Heart className="text-primary mr-2" size={20} fill="currentColor" />
        <h2 className="text-3xl font-semibold text-center">Whispers of the Heart</h2>
        <Heart className="text-primary ml-2" size={20} fill="currentColor" />
      </div>
      
      <div className="neu-element p-6 mb-8">
        <textarea
          className="w-full p-4 rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary h-32 transition-all duration-300"
          placeholder="Write a love letter to your soulmate..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleAddNote}
            className="neu-element px-6 py-2 text-primary font-medium flex items-center hover:scale-105 active:scale-95 transition-all duration-300"
            disabled={!newNote.trim()}
          >
            <Heart size={16} className="mr-2 animate-pulse-soft" fill={newNote.trim() ? "currentColor" : "none"} />
            Send Love Note
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
            <p className="mt-2 text-muted-foreground">Loading love notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 italic relative">
            <div className="absolute opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Heart size={80} className="text-primary" fill="currentColor" />
            </div>
            <p className="relative z-10">
              Your love story awaits its first written whisper. Leave a note that speaks to your heart...
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="neu-element p-6 animate-fade-in relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Delete note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
              
              <p className="mb-4 leading-relaxed">{note.content}</p>
              
              <div className="flex justify-end items-center text-sm text-muted-foreground mt-2">
                <Calendar size={12} className="mr-1" />
                <span>{new Date(note.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoveNotes;
