
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

const LoveNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  
  // Load saved notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('loveNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('loveNotes', JSON.stringify(notes));
  }, [notes]);
  
  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        createdAt: new Date().toISOString()
      };
      
      setNotes([note, ...notes]);
      setNewNote('');
    }
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-semibold text-center mb-8">Love Notes</h2>
      
      <div className="neu-element p-6 mb-8">
        <textarea
          className="w-full p-4 rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary h-32"
          placeholder="Write a love note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleAddNote}
            className="neu-element px-6 py-2 text-primary font-medium flex items-center hover:scale-105 active:scale-95"
          >
            <Heart size={16} className="mr-2" />
            Save Note
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {notes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No notes yet. Write your first love note above!
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="neu-element p-6 animate-fade-in">
              <p className="mb-4">{note.content}</p>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                
                <button 
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoveNotes;
