export const idGen = () => {
    const date = new Date();
    const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      const randomNumbers = Math.floor(10000 + Math.random() * 90000);
      return `${month}/${day}/${year}-${randomNumbers}`;
   };

  export const getCurrentDateTime = () => {
     const date = new Date();
     const month = date.getMonth() + 1;
     const day = date.getDate();
     const year = date.getFullYear();
     const hours = date.getHours().toString().padStart(2, '0');
     const minutes = date.getMinutes().toString().padStart(2, '0');
     return `${month}/${day}/${year} ${hours}:${minutes}`;}