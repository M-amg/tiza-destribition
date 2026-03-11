import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Truck,
  Home,
  Phone,
  Mail,
  Search
} from 'lucide-react';

export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [showTracking, setShowTracking] = useState(false);

  const handleTrack = () => {
    setShowTracking(true);
  };

  const trackingSteps = [
    {
      status: 'Order Placed',
      date: 'March 5, 2026',
      time: '10:30 AM',
      description: 'Your order has been confirmed',
      icon: CheckCircle2,
      completed: true
    },
    {
      status: 'Processing',
      date: 'March 5, 2026',
      time: '2:15 PM',
      description: 'Your order is being prepared',
      icon: Package,
      completed: true
    },
    {
      status: 'Shipped',
      date: 'March 6, 2026',
      time: '9:00 AM',
      description: 'Package has been picked up by courier',
      icon: Truck,
      completed: true
    },
    {
      status: 'Out for Delivery',
      date: 'March 7, 2026',
      time: '8:30 AM',
      description: 'Package is on its way to you',
      icon: MapPin,
      completed: true,
      current: true
    },
    {
      status: 'Delivered',
      date: 'Expected today',
      time: 'By 6:00 PM',
      description: 'Package will be delivered',
      icon: Home,
      completed: false
    }
  ];

  const orderItems = [
    {
      id: 1,
      name: 'Premium Olive Oil',
      image: 'https://images.unsplash.com/photo-1765850257647-811b8d3c20ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMG9pbCUyMHByZW1pdW18ZW58MXx8fHwxNzcyOTI4MDg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      quantity: 2,
      price: 12.99
    },
    {
      id: 2,
      name: 'Organic Orange Juice',
      image: 'https://images.unsplash.com/photo-1640213505284-21352ee0d76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBqdWljZSUyMGJvdHRsZXxlbnwxfHx8fDE3NzI4NDQzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      quantity: 1,
      price: 5.99
    },
    {
      id: 3,
      name: 'Natural Honey',
      image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leSUyMGphciUyMG5hdHVyYWx8ZW58MXx8fHwxNzcyOTA5MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      quantity: 1,
      price: 14.99
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number to track your delivery</p>
        </div>

        {/* Track Order Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="orderNumber" className="mb-2 block">Order Number</Label>
                <Input 
                  id="orderNumber"
                  placeholder="e.g. ORD-2026-001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleTrack}
                  className="bg-[#003d82] hover:bg-[#002d62] h-12 px-8"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Track Order
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              You can find your order number in the confirmation email we sent you.
            </p>
          </CardContent>
        </Card>

        {showTracking && (
          <>
            {/* Order Status Banner */}
            <Card className="mb-8 border-[#003d82] border-2">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-[#003d82] rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Out for Delivery</h2>
                      <p className="text-gray-600 mb-2">Order #ORD-2026-001</p>
                      <p className="text-sm text-gray-500">Expected delivery: Today by 6:00 PM</p>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                    <p className="text-sm font-medium">Arriving Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tracking Timeline */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tracking Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {trackingSteps.map((step, index) => (
                        <div key={index} className="relative flex gap-4">
                          {/* Timeline Line */}
                          {index !== trackingSteps.length - 1 && (
                            <div 
                              className={`absolute left-5 top-12 w-0.5 h-16 ${
                                step.completed ? 'bg-[#003d82]' : 'bg-gray-200'
                              }`}
                            />
                          )}
                          
                          {/* Icon */}
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              step.completed 
                                ? step.current 
                                  ? 'bg-[#003d82] ring-4 ring-blue-100' 
                                  : 'bg-[#003d82]'
                                : 'bg-gray-200'
                            }`}
                          >
                            <step.icon className={`h-5 w-5 ${step.completed ? 'text-white' : 'text-gray-400'}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                              <h3 className={`font-semibold text-lg ${step.current ? 'text-[#003d82]' : 'text-gray-900'}`}>
                                {step.status}
                                {step.current && (
                                  <span className="ml-2 text-sm bg-[#003d82] text-white px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{step.date} • {step.time}</span>
                              </div>
                            </div>
                            <p className="text-gray-600">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items ({orderItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">$43.97</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">$3.52</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-[#003d82]">$47.49</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#003d82]" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-900">John Doe</p>
                      <p className="text-gray-600">123 Main Street, Apt 4B</p>
                      <p className="text-gray-600">New York, NY 10001</p>
                      <div className="pt-3 border-t mt-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>+1 (555) 123-4567</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#003d82]" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Courier</p>
                        <p className="font-medium">Express Delivery Co.</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Tracking Number</p>
                        <p className="font-medium">TRK789456123</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Delivery Method</p>
                        <p className="font-medium">Standard Shipping</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Estimated Delivery</p>
                        <p className="font-medium text-[#003d82]">Today by 6:00 PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Have questions about your order? Our customer support team is here to help.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Support
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {!showTracking && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
            <CardContent className="p-12 text-center">
              <Package className="h-20 w-20 mx-auto text-[#003d82] mb-6" />
              <h3 className="text-2xl font-bold mb-3">Track Your Package</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Enter your order number above to see real-time tracking information and delivery updates.
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Real-time Updates</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Delivery Status</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Location Tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
