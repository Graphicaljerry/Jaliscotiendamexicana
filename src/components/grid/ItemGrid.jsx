import React, { useState, useEffect } from 'react';
import './ItemGrid.css';

function ItemGrid({ onSelectItem }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load categories on mount
  useEffect(() => {
    async function load() {
      try {
        if (window.api) {
          const cats = await window.api.getCategories();
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    load();
  }, []);

  // Load items when category selected
  useEffect(() => {
    if (!selectedCategory) {
      setCategoryItems([]);
      return;
    }
    async function loadItems() {
      setLoading(true);
      try {
        if (window.api) {
          const items = await window.api.getItemsByCategory(selectedCategory.id);
          setCategoryItems(items);
        }
      } catch (err) {
        console.error('Failed to load category items:', err);
      }
      setLoading(false);
    }
    loadItems();
  }, [selectedCategory]);

  // Search debounced
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      if (window.api) {
        const results = await window.api.searchItems(searchQuery);
        setSearchResults(results.slice(0, 20));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleItemClick = (item) => {
    onSelectItem(item);
  };

  const displayItems = searchQuery.length >= 2 ? searchResults : categoryItems;
  const categoryColor = selectedCategory?.color || '#2563EB';

  // Get a color for item card accent
  const getItemColor = (item) => {
    if (selectedCategory?.color) return selectedCategory.color;
    const colors = ['#2563EB', '#16a34a', '#ea580c', '#7c3aed', '#0d9488', '#dc2626', '#ca8a04'];
    let hash = 0;
    const name = item.name || '';
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="item-grid-v2">
      {/* Category Bar */}
      <div className="category-bar">
        <button
          className={`category-pill ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          <span className="category-pill-icon" style={{ backgroundColor: '#6b7280' }}>All</span>
          <span className="category-pill-label">All Items</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory?.id === cat.id ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
          >
            <span className="category-pill-icon" style={{ backgroundColor: cat.color || '#2563EB' }}>
              {cat.name.charAt(0).toUpperCase()}
            </span>
            <span className="category-pill-label">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Section Title + Search */}
      <div className="grid-toolbar">
        <h3 className="grid-section-title">
          {searchQuery.length >= 2
            ? `Search: "${searchQuery}"`
            : selectedCategory
              ? selectedCategory.name
              : 'All Products'}
        </h3>
        <div className="grid-search-wrap">
          <svg className="grid-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="grid-search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid-scroll">
        {loading ? (
          <div className="grid-status">Loading items...</div>
        ) : !selectedCategory && searchQuery.length < 2 ? (
          <div className="grid-status">
            <p>Select a category or search for products</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="grid-status">No items found</div>
        ) : (
          <div className="product-grid">
            {displayItems.map((item) => {
              const color = getItemColor(item);
              return (
                <button
                  key={item.id}
                  className="product-card"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="product-card-image" style={{ backgroundColor: `${color}18` }}>
                    <span className="product-card-letter" style={{ color: color }}>
                      {(item.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="product-card-body">
                    <span className="product-card-name">{item.name}</span>
                    <div className="product-card-pricing">
                      <span className="product-card-price" style={{ color: color }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemGrid;
