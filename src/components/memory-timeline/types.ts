
export interface Memory {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  rawDate?: Date;
}

export interface MemoryFormValues {
  date: Date | undefined;
  title: string;
  description: string;
}
