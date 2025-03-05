import { failToast } from './toast';
import { Note, Folder } from './types';

const getFromStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    failToast(`Failed to load ${key}: ${error}`);
    return [];
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    failToast(`Failed to save ${key}: ${error}`);
  }
};

export const getNotes = (): Note[] => getFromStorage('notes');
export const getTrash = (): Note[] => getFromStorage('trash notes');
export const getFolders = (): Folder[] => getFromStorage('folders');
export const saveNotes = (notes: Note[]) => saveToStorage('notes', notes);
export const saveTrash = (trash: Note[]) => saveToStorage('trash notes', trash);
export const saveFolders = (folders: Folder[]) => saveToStorage('folders', folders);