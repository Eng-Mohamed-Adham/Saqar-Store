import React from 'react';

interface Props {
  currentCategory?: string;
  onSelect: (category: string | undefined) => void;
}

const CategorySidebar: React.FC<Props> = ({ currentCategory, onSelect }) => {
  const categories = ['All', 'fashion', 'furniture', 'electronics', 'sports', 'jewelry'];

  return (
    <aside className="border rounded-lg shadow p-4 bg-gray-50">
      <h3 className="font-bold text-lg mb-4">🧭 Main Categories</h3>
      <ul className="space-y-2 text-gray-700">
        {categories.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => onSelect(cat === 'All' ? undefined : cat)}
              className={`block w-full text-start hover:text-blue-600 ${
                currentCategory === (cat === 'All' ? undefined : cat) ? 'font-bold text-blue-700' : ''
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
