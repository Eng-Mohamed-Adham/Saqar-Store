import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { useGetAllProductsQuery } from '../features/products/productApi';
import { useGetAllOffersQuery } from '../features/offers/offerApi';

const HomePage = () => {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  const { data: products, isLoading: loadingProducts } = useGetAllProductsQuery({
    category: categoryFilter,
    page,
  });
  const { data: offers } = useGetAllOffersQuery({});

  const getLatestProducts = (arr: any[], count: number) => {
    const sorted = [...arr].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted.slice(0, count);
  };

  const getRandomProducts = (arr: any[], count: number) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  };

  const featured = Array.isArray(products?.products) ? getLatestProducts(products.products, 4) : [];
  const trending = Array.isArray(products?.products) ? getRandomProducts(products.products, 3) : [];
  const activeOffers = offers?.filter((offer: any) => new Date(offer.expiresAt) > new Date()) || [];

  const testimonials = [
    { name: 'Alena Antony', text: 'Excellent excellent location!', avatar: '/personOne.avif' },
    { name: 'Sara Refolt', text: 'The order arrived quickly and of excellent quality.', avatar: '/personTow.jpg' },
    { name: 'Emma Adams', text: 'The best online shopping experience.', avatar: '/personThree.avif' },
  ];

  const brandLogos = ['/logobrandOne.png', '/logobrandTow.png', '/logobrandThree.png', '/logobrandFour.jpg'];

  return (
    <div className="space-y-12 dark:bg-gray-900 dark:text-white pt-[100px]">
      <section className="bg-[#F2F0F1] dark:bg-gray-800 py-20 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Discover and Find Your <br /> Own Fashion!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Explore our curated collection of stylish and trendy clothing pieces tailored to elevate your fashion game.
            </p>
            <Link to="/products" className="inline-flex items-center bg-black text-white px-6 py-3 rounded-md hover:bg-[#333] transition">
              Explore Now <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div>
            <img
              src="https://cdn.prod.website-files.com/6185b708a2657014268d2eaf/62f375ee3621a4b8441bedc6_2%20(15).webp"
              alt="Hero"
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 max-w-6xl mx-auto text-center">
        {[
          { icon: '🚚', title: 'Free Shipping', desc: 'For all orders over $100' },
          { icon: '🔒', title: 'Secure Payment', desc: 'Through trusted gateways' },
          { icon: '💬', title: '24/7 Support', desc: 'Always at your service' },
          { icon: '✅', title: 'Product Guarantee', desc: '6-month warranty' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-800 shadow rounded">
            <p className="font-bold text-lg mb-2">{item.icon} {item.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 max-w-6xl mx-auto">
        {activeOffers.slice(0, 2).map((offer) => (
          <div key={offer._id} className="bg-[#F2F0F1] dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col justify-between">
            <img src={offer.image} alt={offer.title} className="w-full h-40 object-cover rounded-md mb-4" />
            <h2 className="text-2xl font-bold mb-2">{offer.title}</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{offer.description}</p>
            <Link to="/offers" className="text-blue-600 font-semibold hover:underline">Explore Offers</Link>
          </div>
        ))}
      </section>

      <section className="py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Trending Products 🔥</h2>
            <Link to="/products" className="text-black dark:text-white hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trending.map((product) => (
              <div key={product._id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition">
                <img src={product.image || '/no-image.jpg'} alt={product.name} className="w-full h-40 object-cover rounded mb-2" />
                <h4 className="font-semibold mb-1 truncate">{product.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{product.description?.slice(0, 60) ?? ''}</p>
                <p className="text-primary font-bold">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <section className="px-4 max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Featured Products</h3>
                <Link to="/products" className="text-blue-600 hover:underline font-medium">View All</Link>
              </div>
              {loadingProducts ? (
                <p className="text-center text-gray-500">Loading products...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featured.map((product) => (
                    <div key={product._id} className="border rounded-lg p-3 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition">
                      <img src={product.image || '/no-image.jpg'} alt={product.name} className="w-full h-40 object-cover rounded mb-2" />
                      <h4 className="font-semibold mb-1 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">${product.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      <section className="bg-[#F2F0F1] dark:bg-gray-800 py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
                <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300 italic">"{t.text}"</p>
                <p className="mt-2 font-semibold">- {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 max-w-6xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-6">Our Trusted Brands</h3>
        <div className="flex flex-wrap justify-center items-center gap-6">
          {brandLogos.map((src, i) => (
            <img key={i} src={src} alt={`brand-${i}`} className="h-12 object-contain grayscale hover:grayscale-0 transition" />
          ))}
        </div>
      </section>

      <section className="py-16 px-6 md:px-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Join Our Newsletter</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
          Stay in the loop with the latest trends, promotions, and exclusive discounts!
        </p>
        <form className="flex justify-center gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
          <button type="submit" className="bg-black text-white px-6 py-2 rounded-md">
            Subscribe
          </button>
        </form>
      </section>

      <footer className="bg-black text-white py-10 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-2">Fashion Store</h3>
            <p className="text-sm text-gray-400">
              Your go-to destination for the latest fashion trends. Shop smart, look sharp.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-sm text-gray-400">Email: info@fashionstore.com</p>
            <p className="text-sm text-gray-400">Phone: +123 456 789</p>
          </div>
        </div>
        <div className="mt-10 text-center text-xs text-gray-500">
          &copy; 2025 Fashion Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
