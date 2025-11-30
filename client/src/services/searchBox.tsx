import React, { useState, useEffect, useRef } from 'react';
import { useLazySearchItemsQuery } from '../features/search/searchApi';
import { Link } from 'react-router-dom';

const SearchBox = () => {
  const [query, setQuery] = useState('');
  const [trigger, result] = useLazySearchItemsQuery();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  // Trigger search
  useEffect(() => {
    if (debouncedQuery.trim()) {
      trigger(debouncedQuery);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide result list on click
  const handleSelect = () => {
    setQuery('');
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className="w-full px-4 sm:px-6 lg:px-8 mt-4">
      <div className="relative max-w-3xl mx-auto">
        <input
          type="text"
          value={query}
          placeholder="Search for products or offers..."
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />

        {showResults && result.data && (result.data.products.length > 0 || result.data.offers.length > 0) && (
          <div className="absolute z-50 bg-white dark:bg-gray-900 shadow-lg w-full mt-2 rounded-xl overflow-hidden max-h-96 overflow-y-auto border dark:border-gray-700">
            <div className="p-3 border-b text-gray-500 dark:text-gray-300 text-sm">🔍 Results</div>

            {result.data.products.map((product: any) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                onClick={handleSelect}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition"
              >
                <img
                  src={product.image || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-gray-800 dark:text-gray-100">🔸 {product.name}</span>
              </Link>
            ))}

            {result.data.offers.map((offer: any) => (
              <Link
                key={offer._id}
                to={`/offers/${offer._id}`}
                onClick={handleSelect}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition"
              >
                <img
                  src={offer.image || '/placeholder-offer.png'}
                  alt={offer.title}
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-gray-800 dark:text-gray-100">🔹 {offer.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
