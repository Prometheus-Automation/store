import { motion, AnimatePresence } from 'framer-motion';
import { FacetedFiltersProps } from '../types';

const FacetedFilters = ({ filters, setFilters, showFilters, setShowFilters }: FacetedFiltersProps) => {
  const sources = ['OpenAI', 'Anthropic', 'xAI', 'n8n', 'Zapier', 'Make', 'Python'];
  const useCases = ['productivity', 'sales', 'support', 'content', 'marketing', 'data'];
  
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Price Range</h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [0, parseInt(e.target.value)]
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span>${filters.priceRange[1]}/month</span>
                </div>
              </div>
            </div>

            {/* Sources */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Source</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {sources.map(source => (
                  <label key={source} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            sources: [...prev.sources, source]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            sources: prev.sources.filter(s => s !== source)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    {source}
                  </label>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Use Case</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {useCases.map(useCase => (
                  <label key={useCase} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.useCases.includes(useCase)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            useCases: [...prev.useCases, useCase]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            useCases: prev.useCases.filter(u => u !== useCase)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    {useCase.charAt(0).toUpperCase() + useCase.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Minimum Rating</h4>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  rating: parseFloat(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="0">Any Rating</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.8">4.8+ Stars</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <button
              onClick={() => setFilters({
                category: 'all',
                priceRange: [0, 1000],
                sources: [],
                useCases: [],
                rating: 0,
                difficulty: [],
                searchQuery: ''
              })}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FacetedFilters;