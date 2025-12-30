// hooks/useDebouncedSearch.js
import { useState, useEffect, useMemo } from 'react';

const useDebouncedSearch = (searchTerm, options, searchKeys = ['label'], delay = 300) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  const filteredOptions = useMemo(() => {
    if (!debouncedSearch) return options;
    
    const searchTermLower = debouncedSearch.toLowerCase();
    return options.filter(option =>
      searchKeys.some(key => 
        option[key]?.toLowerCase().includes(searchTermLower)
      )
    );
  }, [debouncedSearch, options, searchKeys]);

  return filteredOptions;
};

export default useDebouncedSearch;