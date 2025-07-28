import { motion } from 'framer-motion';
import { X, CheckCircle, ShoppingCart } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addItem } = useCart();
  
  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <X size={20} />
          </button>

          {/* Product Video/Image */}
          <div className="h-64 overflow-hidden rounded-t-xl">
            {product.videoUrl ? (
              <ReactPlayer
                url={product.videoUrl}
                width="100%"
                height="100%"
                playing={true}
                controls={true}
                config={{
                  youtube: {
                    playerVars: {
                      origin: typeof window !== 'undefined' ? window.location.origin : 'https://store.prometheusautomation.com'
                    }
                  }
                }}
              />
            ) : (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            )}
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-lg text-gray-600">{product.tagline}</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline">
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through mr-2">
                      ${product.originalPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-lg text-gray-600 ml-1">{product.unit}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={16} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Performance Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(product.stats || {}).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-blue-600">{value}</div>
                    <div className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <motion.button
              onClick={() => {
                addItem(product);
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingCart className="mr-2" size={20} />
              Add to Cart - ${product.price}{product.unit}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuickViewModal;