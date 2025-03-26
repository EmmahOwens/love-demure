
import React, { useState } from 'react';
import { Heart, PenLine, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { parse, format } from 'date-fns';

interface Memory {
  id: number;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  rawDate?: Date;
}

// Sample memories data - you can replace with your own
const defaultMemories = [
  {
    id: 1,
    date: 'May 20, 2018',
    title: 'Our First Date',
    description: 'We went to that cute café downtown and talked for hours.',
    imageUrl: '',
    rawDate: new Date(2018, 4, 20)
  },
  {
    id: 2,
    date: 'December 25, 2018',
    title: 'First Christmas Together',
    description: 'Remember that ugly sweater you wore? Still makes me smile!',
    imageUrl: '',
    rawDate: new Date(2018, 11, 25)
  },
  {
    id: 3,
    date: 'May 20, 2019',
    title: 'One Year Anniversary',
    description: 'That surprise picnic in the park was perfect.',
    imageUrl: '',
    rawDate: new Date(2019, 4, 20)
  },
  {
    id: 4,
    date: 'May 20, 2023',
    title: 'Five Years Together',
    description: 'The journey continues to be amazing with you.',
    imageUrl: '',
    rawDate: new Date(2023, 4, 20)
  }
];

interface MemoryFormValues {
  date: Date | undefined;
  title: string;
  description: string;
}

const MemoryEditDialog = ({ memory, onSave, onClose }: { 
  memory: Memory, 
  onSave: (id: number, data: MemoryFormValues) => void,
  onClose: () => void 
}) => {
  const form = useForm<MemoryFormValues>({
    defaultValues: {
      date: memory.rawDate || new Date(),
      title: memory.title,
      description: memory.description
    }
  });

  const handleSubmit = (data: MemoryFormValues) => {
    onSave(memory.id, data);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Memory</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
                    label="Select date" 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Memory title" />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe this memory..." 
                    className="min-h-[100px]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

const MemoryCard: React.FC<{ 
  memory: Memory; 
  index: number;
  onEdit: (memory: Memory) => void;
}> = ({ memory, index, onEdit }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`flex w-full ${isEven ? 'justify-start' : 'justify-end'} mb-12`}>
      <div className={`neu-element p-6 max-w-md animate-fade-in relative group transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1`} 
        style={{ animationDelay: `${index * 0.1}s` }}>
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(memory)}
        >
          <PenLine size={16} />
        </Button>
        
        <div className="mb-2 text-sm text-muted-foreground">{memory.date}</div>
        <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
        <p className="text-foreground/80">{memory.description}</p>
        
        {memory.imageUrl && (
          <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            className="w-full h-40 object-cover rounded-lg mt-4 transition-transform duration-500 hover:scale-105"
          />
        )}
        
        <div className="flex justify-end mt-4">
          <Heart size={18} className="text-primary animate-heart-beat" fill="currentColor" />
        </div>
      </div>
    </div>
  );
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

const MemoryTimeline: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>(defaultMemories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  
  const handleAddMemory = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
  };
  
  const handleSaveMemory = (id: number, data: MemoryFormValues) => {
    if (!data.date) return;
    
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
    toast.success("Memory updated successfully!");
  };
  
  const handleCloseEdit = () => {
    setEditingMemory(null);
  };

  const addNewMemory = (data: MemoryFormValues) => {
    if (!data.date) return;
    
    const newMemory = {
      id: Date.now(),
      title: data.title,
      description: data.description,
      date: format(data.date, 'MMMM d, yyyy'),
      rawDate: data.date,
      imageUrl: ''
    };
    
    setMemories(prev => [...prev, newMemory]);
    setIsAddDialogOpen(false);
    toast.success("New memory added!");
  };
  
  // Create a form for adding new memories
  const addForm = useForm<MemoryFormValues>({
    defaultValues: {
      date: new Date(),
      title: '',
      description: ''
    }
  });
  
  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-semibold text-center mb-12">Our Memories</h2>
      
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border"></div>
        
        {/* Memories */}
        {memories.map((memory, index) => (
          <MemoryCard 
            key={memory.id} 
            memory={memory} 
            index={index} 
            onEdit={handleEditMemory}
          />
        ))}
        
        {/* Add memory button */}
        <AddMemoryButton onClick={handleAddMemory} />
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Memory</DialogTitle>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(addNewMemory)} className="space-y-4 mt-4">
              <FormField
                control={addForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange} 
                        label="Select date" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Memory title" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe this memory..." 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Save Memory
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoryTimeline;
