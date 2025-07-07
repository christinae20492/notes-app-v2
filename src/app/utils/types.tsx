export interface Note {
    dateDeleted: string;
    id: string;
    title: string;
    body: string;
    color: string;
    category: string;
    tag: string;
    dateCreated: string;
    dateUpdated: string;
    user: string;
  }

    
  export interface Folder {
    id: string;
    title: string;
    dateCreated: string;
    dateUpdated: string;
    user: string;
    notes: Note[];
  }
  
  export interface EditFolder {
    title?: string;
  }
  
  export interface EditNote {
    dateDeleted?: string;
    title?: string;
    body?: string;
    color?: string;
    category?: string;
    tag?: string;
  }
  
  export interface NewFolder {
    title: string;
  }

  export interface NewNote {
    title: string;
    body: string;
    color: string;
    category: string;
    tag: string;
    folderId?: string;
  }
