
import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import MemoryCard from './memory-timeline/MemoryCard';
import MemoryEditDialog from './memory-timeline/MemoryEditDialog';
import AddMemoryDialog from './memory-timeline/AddMemoryDialog';
import { Memory, MemoryFormValues } from './memory-timeline/types';

const MemoryTimeline: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load memories from Supabase
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('memory_timeline')
          .select('*')
          .order('raw_date', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        // Transform the data to match our Memory interface
        const formattedMemories = data.map(memory => ({
          id: memory.id,
          title: memory.title,
          description: memory.description || '',
          date: memory.date,
          imageUrl: memory.image_url || '',
          rawDate: memory.raw_date ? new Date(memory.raw_date) : undefined
        }));
        
        setMemories(formattedMemories);
      } catch (error) {
        console.error('Error fetching memories:', error);
        setError('Failed to load memories');
        toast.error('Failed to load memories');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemories();
  }, []);
  
  const handleAddMemory = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
  };
  
  const handleDeleteMemory = async (id: string) => {
    try {
      // Delete the memory from Supabase
      const { error } = await supabase
        .from('memory_timeline')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Remove the memory from local state
      setMemories(memories.filter(memory => memory.id !== id));
      toast.success('Memory deleted successfully');
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory');
    }
  };
  
  const handleSaveMemory = async (id: string, data: MemoryFormValues) => {
    if (!data.date) return;
    
    try {
      // Update the memory in Supabase
      const { error } = await supabase
        .from('memory_timeline')
        .update({
          title: data.title,
          description: data.description,
          date: format(data.date, 'MMMM d, yyyy'),
          raw_date: data.date.toISOString()
        })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update the memory in local state
      setMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === id 
            ? { 
                ...memory, 
                title: data.title,
                description: data.description,
                date: format(data.date, 'MMMM d, yyyy'),
                rawDate: data.date
              } 
            : memory
        )
      );
      
      setEditingMemory(null);
      toast.success("Memory updated successfully!");
    } catch (error) {
      console.error('Error updating memory:', error);
      toast.error('Failed to update memory');
    }
  };
  
  const handleCloseEdit = () => {
    setEditingMemory(null);
  };

  const addNewMemory = async (data: MemoryFormValues) => {
    if (!data.date) return;
    
    try {
      // Insert the new memory into Supabase
      const { data: newMemoryData, error } = await supabase
        .from('memory_timeline')
        .insert({
          title: data.title,
          description: data.description,
          date: format(data.date, 'MMMM d, yyyy'),
          raw_date: data.date.toISOString()
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add the new memory to local state
      const newMemory: Memory = {
        id: newMemoryData.id,
        title: newMemoryData.title,
        description: newMemoryData.description || '',
        date: newMemoryData.date,
        imageUrl: newMemoryData.image_url || '',
        rawDate: new Date(newMemoryData.raw_date)
      };
      
      setMemories(prev => [...prev, newMemory]);
      setIsAddDialogOpen(false);
      toast.success("New memory added!");
    } catch (error) {
      console.error('Error adding memory:', error);
      toast.error('Failed to add memory');
    }
  };
  
  const AddMemoryButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <div className="flex justify-center my-10">
        <Button onClick={onClick} className="gap-2 transition-transform duration-300 hover:scale-105">
          <Plus size={16} />
          Add Memory
        </Button>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-semibold text-center mb-12">Our Memories</h2>
      
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border"></div>
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
            <p className="mt-2 text-muted-foreground">Loading memories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive flex flex-col items-center">
            <AlertTriangle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Memories */}
            {memories.map((memory, index) => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                index={index} 
                onEdit={handleEditMemory}
                onDelete={handleDeleteMemory}
              />
            ))}
            
            {/* Add memory button */}
            <AddMemoryButton onClick={handleAddMemory} />
          </>
        )}
      </div>
      
      {/* Edit dialog */}
      {editingMemory && (
        <Dialog open={!!editingMemory} onOpenChange={(open) => !open && handleCloseEdit()}>
          <MemoryEditDialog 
            memory={editingMemory} 
            onSave={handleSaveMemory}
            onClose={handleCloseEdit}
          />
        </Dialog>
      )}
      
      {/* Add dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <AddMemoryDialog 
          onSave={addNewMemory}
          onClose={() => setIsAddDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default MemoryTimeline;
