import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Main Banner */}
        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1578496780896-7081cc23c111?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBkaW5uZXIlMjB0YWJsZXxlbnwxfHx8fDE3NzI5MDM3MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Family dinner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-xl text-white space-y-6">
                <div className="inline-block px-4 py-2 bg-[#003d82] rounded-full text-sm font-medium">
                  New Arrivals
                </div>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Fresh Quality Food for Your Family
                </h1>
                <p className="text-lg text-gray-100">
                  Shop fresh groceries, organic produce, and daily essentials delivered to your door
                </p>
                <Button size="lg" className="bg-[#003d82] hover:bg-[#002d62] text-white h-14 px-8 text-lg">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}