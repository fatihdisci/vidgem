export interface Note {
  id: string;
  text: string;
  x: number;
  y: number;
  duration: number; // Director Mode: Time to stay on screen (in seconds)
}

export interface Scene {
  id: string;
  imageUrl: string;
  notes: Note[];
}
