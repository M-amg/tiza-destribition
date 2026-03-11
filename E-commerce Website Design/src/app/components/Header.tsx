import { Search, ShoppingCart, User, Heart, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link } from 'react-router';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-[#003d82] text-white">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span>📞 +1 (555) 123-4567</span>
              <span>📧 support@store.com</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/track-order" className="hover:text-gray-200">Track Order</Link>
              <span>|</span>
              <a href="#" className="hover:text-gray-200">Help</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-[#003d82] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">M</span>
                </div>
                <span className="text-2xl font-bold text-[#003d82]">MARKET</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Input 
                  type="search" 
                  placeholder="Search for products..." 
                  className="w-full h-12 pl-4 pr-12 rounded-lg border-2 border-gray-200 focus:border-[#003d82]"
                />
                <Button 
                  size="icon" 
                  className="absolute right-1 top-1 h-10 w-10 bg-[#003d82] hover:bg-[#002d62]"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="hidden md:flex flex-col h-auto py-2 hover:text-[#003d82]">
                  <User className="h-6 w-6" />
                  <span className="text-xs mt-1">Account</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="hidden md:flex flex-col h-auto py-2 hover:text-[#003d82]">
                <Heart className="h-6 w-6" />
                <span className="text-xs mt-1">Wishlist</span>
              </Button>
              <Button variant="ghost" size="icon" className="flex flex-col h-auto py-2 hover:text-[#003d82] relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs mt-1">Cart</span>
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  3
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-8 h-12 overflow-x-auto">
            <a href="#" className="text-sm font-medium hover:text-[#003d82] whitespace-nowrap transition-colors">All Categories</a>
            <a href="#" className="text-sm font-medium hover:text-[#003d82] whitespace-nowrap transition-colors">Fresh Produce</a>
            <a href="#" className="text-sm font-medium hover:text-[#003d82] whitespace-nowrap transition-colors">Dairy & Eggs</a>
            <a href="#" className="text-sm font-medium hover:text-[#003d82] whitespace-nowrap transition-colors">Bakery</a>
            <a href="#" className="text-sm font-medium hover:text-[#003d82] whitespace-nowrap transition-colors">Beverages</a>
            <a href="#" className="text-sm font-medium hover:text-[#003d82] whitespace-nowrap transition-colors">Snacks</a>
            <a href="#" className="text-sm font-medium hover:text-[#003d82] whitespace-nowrap transition-colors">Household</a>
            <a href="#" className="text-sm font-medium text-red-600 hover:text-red-700 whitespace-nowrap transition-colors">🔥 Special Offers</a>
          </nav>
        </div>
      </div>
    </header>
  );
}