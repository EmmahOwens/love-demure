
import React, { useState } from 'react';
import { Heart } from 'lucide-react';

// Sample memories data - you can replace with your own
const defaultMemories = [
  {
    id: 1,
    date: 'May 20, 2018',
    title: 'Our First Date',
    description: 'We went to that cute café downtown and talked for hours.',
    imageUrl: '' // Add image URL if you have one
  },
  {
    id: 2,
    date: 'December 25, 2018',
    title: 'First Christmas Together',
    description: 'Remember that ugly sweater you wore? Still makes me smile!',
    imageUrl: ''
  },
  {
    id: 3,
    date: 'May 20, 2019',
    title: 'One Year Anniversary',
    description: 'That surprise picnic in the park was perfect.',
    imageUrl: ''
  },
  {
    id: 4,
    date: 'May 20, 2023',
    title: 'Five Years Together',
    description: 'The journey continues to be amazing with you.',
    imageUrl: ''
  }
];

interface Memory {
  id: number;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
}

const MemoryCard: React.FC<{ memory: Memory; index: number }> = ({ memory, index }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`flex w-full ${isEven ? 'justify-start' : 'justify-end'} mb-12`}>
      <div className={`neu-element p-6 max-w-md animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="mb-2 text-sm text-muted-foreground">{memory.date}</div>
        <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
        <p className="text-foreground/80">{memory.description}</p>
        
        {memory.imageUrl && (
          <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            className="w-full h-40 object-cover rounded-lg mt-4"
          />
        )}
        
        <div className="flex justify-end mt-4">
          <Heart size={18} className="text-primary" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

const MemoryTimeline: React.FC = () => {
  const [memories] = useState<Memory[]>(defaultMemories);
  
  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-semibold text-center mb-12">Our Memories</h2>
      
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border"></div>
        
        {/* Memories */}
        {memories.map((memory, index) => (
          <MemoryCard key={memory.id} memory={memory} index={index} />
        ))}
        
        {/* Add memory form would go here */}
      </div>
    </div>
  );
};

export default MemoryTimeline;
