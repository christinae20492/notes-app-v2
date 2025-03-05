export interface Note {
    dateDeleted: string;
    id: string;
    title: string;
    body: string;
    color: string;
    category: string;
    tag: string;
    dateCreated: string;
  }
  
  export interface Folder {
    id: string;
    title: string;
    dateCreated: string;
    notes: Note[];
  }
  