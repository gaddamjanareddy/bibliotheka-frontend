import axios from 'axios';

export const fetchBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (response.data.totalItems > 0) {
      const info = response.data.items[0].volumeInfo;
      return {
        title: info.title,
        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
        description: info.description,
        coverUrl: info.imageLinks?.thumbnail,
        genre: info.categories ? info.categories[0] : 'Fiction',
        year: info.publishedDate ? info.publishedDate.split('-')[0] : '',
        totalPages: info.pageCount
      };
    }
    return null;
  } catch (error) {
    console.error("Google Books API Error:", error);
    return null;
  }
};