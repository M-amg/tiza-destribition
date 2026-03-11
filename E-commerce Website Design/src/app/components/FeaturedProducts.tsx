import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: 'Premium Olive Oil',
      price: 12.99,
      originalPrice: 16.99,
      image: 'https://images.unsplash.com/photo-1765850257647-811b8d3c20ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMG9pbCUyMHByZW1pdW18ZW58MXx8fHwxNzcyOTI4MDg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.5,
      reviews: 128,
      badge: '24% OFF',
      unit: '750ml'
    },
    {
      id: 2,
      name: 'Organic Orange Juice',
      price: 5.99,
      image: 'https://images.unsplash.com/photo-1640213505284-21352ee0d76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBqdWljZSUyMGJvdHRsZXxlbnwxfHx8fDE3NzI4NDQzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 5,
      reviews: 234,
      unit: '1L'
    },
    {
      id: 3,
      name: 'Natural Honey',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leSUyMGphciUyMG5hdHVyYWx8ZW58MXx8fHwxNzcyOTA5MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.8,
      reviews: 456,
      unit: '500g'
    },
    {
      id: 4,
      name: 'Cooking Oil',
      price: 8.99,
      originalPrice: 11.99,
      image: 'https://images.unsplash.com/photo-1757801333069-f7b3cabaec4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsJTIwYm90dGxlfGVufDF8fHx8MTc3MjkyODA4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.7,
      reviews: 89,
      badge: '25% OFF',
      unit: '1L'
    },
    {
      id: 5,
      name: 'Premium Olive Oil',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1765850257647-811b8d3c20ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMG9pbCUyMHByZW1pdW18ZW58MXx8fHwxNzcyOTI4MDg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.3,
      reviews: 67,
      unit: '500ml'
    },
    {
      id: 6,
      name: 'Bottled Water Pack',
      price: 4.99,
      image: 'https://images.unsplash.com/photo-1557183200-f0fec6612738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGJvdHRsZXMlMjBwYWNrfGVufDF8fHx8MTc3MjkyODA4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.9,
      reviews: 523,
      unit: '12 x 500ml'
    },
    {
      id: 7,
      name: 'Organic Honey',
      price: 18.99,
      originalPrice: 24.99,
      image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leSUyMGphciUyMG5hdHVyYWx8ZW58MXx8fHwxNzcyOTA5MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.8,
      reviews: 312,
      badge: '24% OFF',
      unit: '1kg'
    },
    {
      id: 8,
      name: 'Fresh Orange Juice',
      price: 7.99,
      image: 'https://images.unsplash.com/photo-1640213505284-21352ee0d76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBqdWljZSUyMGJvdHRsZXxlbnwxfHx8fDE3NzI4NDQzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 5,
      reviews: 198,
      unit: '1.5L'
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Button variant="outline" className="border-[#003d82] text-[#003d82] hover:bg-[#003d82] hover:text-white">
            View All Products
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-300">
              <div className="relative overflow-hidden bg-white aspect-square p-4">
                {product.badge && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2.5 py-1 rounded text-xs font-bold">
                    {product.badge}
                  </div>
                )}
                
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute top-2 right-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 border-t">
                <h3 className="font-medium mb-1.5 line-clamp-2 text-sm text-gray-900 min-h-[40px]">{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                </div>

                <p className="text-xs text-gray-500 mb-2">{product.unit}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#003d82]">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-[#003d82] hover:bg-[#002d62] text-white h-9 text-sm">
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}