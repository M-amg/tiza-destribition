import { Button } from './ui/button';
import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

export function PromoSection() {
  const features = [
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'On orders over $50'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% safe & secure'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day money back'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Always here to help'
    }
  ];

  return (
    <>
      {/* Features */}
      <section className="py-12 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#003d82]/10 text-[#003d82] rounded-full mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Get exclusive deals, new product alerts, and healthy recipes delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 px-5 py-3.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-[#003d82] text-base"
              />
              <Button className="bg-[#003d82] hover:bg-[#002d62] text-white h-12 px-8 text-base font-medium">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}