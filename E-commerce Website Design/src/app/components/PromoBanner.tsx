import { Button } from './ui/button';

export function PromoBanner() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#003d82] to-[#0051a8] rounded-2xl overflow-hidden shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className="text-white space-y-4">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                Limited Time Offer
              </div>
              <h2 className="text-4xl font-bold leading-tight">
                Get 30% OFF on All Fresh Products
              </h2>
              <p className="text-lg text-blue-100">
                Stock up on your favorite fresh groceries and save big. Offer valid until March 15, 2026
              </p>
              <Button size="lg" className="bg-white text-[#003d82] hover:bg-gray-100 h-12 px-8">
                Shop Now & Save
              </Button>
            </div>
            <div className="relative h-64 md:h-80">
              <img 
                src="https://images.unsplash.com/photo-1722810767143-40a6a7a74b13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdmVnZXRhYmxlcyUyMGZyZXNofGVufDF8fHx8MTc3MjkyODA4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fresh vegetables"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
