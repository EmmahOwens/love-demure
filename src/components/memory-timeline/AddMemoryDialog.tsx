
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { MemoryFormValues } from './types';

interface AddMemoryDialogProps {
  onSave: (data: MemoryFormValues) => void;
  onClose: () => void;
}

const AddMemoryDialog: React.FC<AddMemoryDialogProps> = ({ onSave, onClose }) => {
  const form = useForm<MemoryFormValues>({
    defaultValues: {
      date: new Date(),
      title: '',
      description: ''
    }
  });

  const handleSubmit = (data: MemoryFormValues) => {
    onSave(data);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Memory</DialogTitle>
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
              <Save className="mr-2 h-4 w-4" /> Save Memory
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddMemoryDialog;
