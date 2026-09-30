import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and Sorting
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('default');

  // Keep selectedCategory in sync with URL searchParams if categoryParam changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/products');
      const data = Array.isArray(response.data) ? response.data : [];
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Derive unique categories dynamically from products
  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low-high') return a.price - b.price;
        if (sortBy === 'price-high-low') return b.price - a.price;
        return 0; // default
      });
  }, [products, selectedCategory, search, sortBy]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="product-listing-page stride-container">
      <div className="catalog-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          All Products
        </h1>
        <p className="text-meta" style={{ marginTop: 'var(--space-8)' }}>
          Explore our collection of premium footwear designed for comfort and durability.
        </p>
      </div>

      {/* Control Bar: Search, Category Filter, Price Sort */}
      <div className="catalog-controls">
        <div className="control-group search-group">
          <label htmlFor="catalog-search" className="sr-only">
            Search products
          </label>
          <input
            id="catalog-search"
            type="search"
            placeholder="Search by name or style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="control-input"
          />
        </div>

        {categories.length > 1 && (
          <div className="control-group">
            <label htmlFor="category-select" className="sr-only">
              Filter by Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="control-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="control-group">
          <label htmlFor="sort-select" className="sr-only">
            Sort Products
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="default">Sort: Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="product-card-skeleton">
              <div className="skeleton-img" />
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="state-banner error-banner">
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-secondary btn-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Empty Filter Results State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="state-banner empty-banner">
          <h3>No products found</h3>
          <p>Try adjusting your search query or selected category filter.</p>
          <button
            onClick={() => {
              setSearch('');
              handleCategoryChange('all');
              setSortBy('default');
            }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 'var(--space-16)' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
