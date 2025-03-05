import React, { useState } from 'react';
import { sortNotes } from '@/app/utils/noteutility';
import { faRectangleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface SortPickerProps {
  isOpen: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  notes: any[];
  setNotes: React.Dispatch<React.SetStateAction<any[]>>;
}

export const SortPicker: React.FC<SortPickerProps> = ({ isOpen, setIsModalVisible, notes, setNotes }) => {
  if (!isOpen) return null;

  const [selectedValue, setSelectedValue] = useState('dateDescending');

  const handleSortChange = (value: string) => {
    setSelectedValue(value);
    let sortedNotes = [];
    
    switch (value) {
      case 'dateAscending':
        sortedNotes = sortNotes(notes, 'dateCreated').reverse();
        break;
      case 'dateDescending':
        sortedNotes = sortNotes(notes, 'dateCreated');
        break;
      case 'title':
        sortedNotes = sortNotes(notes, 'title');
        break;
      case 'category':
        sortedNotes = sortNotes(notes, 'category');
        break;
      default:
        sortedNotes = notes;
        break;
    }

    setNotes(sortedNotes);
    setIsModalVisible(false);
  };

  const DATA = [
    { value: 'dateAscending', title: 'Date (Ascending)' },
    { value: 'dateDescending', title: 'Date (Descending)' },
    { value: 'title', title: 'Note Title' },
    { value: 'category', title: 'Note Category' },
  ];

  return (
    <div className="z-10 bg-white bg-opacity-30 w-5/6 h-1/4 block">
      <div>
        <button onClick={() => setIsModalVisible(false)} className="close-btn">
        <FontAwesomeIcon icon={faRectangleXmark} />
        </button>
        
        <ul className="p-2">
          {DATA.map((item) => (
            <li key={item.value}>
              <button onClick={() => handleSortChange(item.value)} className={`sort-option ${selectedValue === item.value ? 'sort-option-selected' : ''}`}>
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};