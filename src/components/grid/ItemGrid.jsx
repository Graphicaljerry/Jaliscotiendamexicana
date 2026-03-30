import React, { useState, useEffect } from 'react';
import './ItemGrid.css';

// Default category colors
const CATEGORY_COLORS = [
  '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#319795',
  '#3182CE', '#5A67D8', '#805AD5', '#D53F8C', '#E53E3E',
  '#C05621', '#2F855A', '#2B6CB0', '#553C9A', '#B83280',
  '#9C4221', '#276749', '#2A4365', '#44337A', '#97266D',
  '#C53030', '#DD6B20', '#D69E2E', '#38A169', '#319795',
  '#3182CE', '#5A67D8'
];

function ItemGrid({ onSelectItem, onHideGrid }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleItemClick = (item) => {
    onSelectItem(item);
  };

  return (
    <div className="item-grid">
      <div className="grid-header">
        <h2 className="grid-title">
          {selectedCategory ? selectedCategory.name : 'Categories'}
        </h2>
        <div className="grid-header-buttons">
          <button
            className="btn-change-grid"
            onClick={() => setSelectedCategory(null)}
          >
            {selectedCategory ? 'Back to Categories' : 'Change Grid'}
          </button>
          <button className="btn-hide-grid" onClick={onHideGrid}>
            Hide Grid
          </button>
        </div>
      </div>

      <div className="grid-body">
        {!selectedCategory ? (
          /* ─── CATEGORY GRID ────────────────────────────── */
          <div className="grid-buttons category-grid">
            {categories.map((cat, index) => (
              <button
                key={cat.id}
                className="grid-btn category-btn"
                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        ) : (
          /* ─── ITEM SUB-GRID ────────────────────────────── */
          <div className="grid-buttons item-subgrid">
            {loading ? (
              <div className="grid-loading">Loading items...</div>
            ) : categoryItems.length === 0 ? (
              <div className="grid-empty">No items in this category</div>
            ) : (
              categoryItems.map((item) => (
                <button
                  key={item.id}
                  className="grid-btn item-btn"
                  style={{ backgroundColor: item.button_color || '#4A90D9' }}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="item-btn-name">{item.name}</span>
                  <span className="item-btn-price">${item.price.toFixed(2)}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemGrid;
