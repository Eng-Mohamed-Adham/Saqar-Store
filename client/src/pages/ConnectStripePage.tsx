import React from 'react';
import { useCreateStripeExpressAccountMutation } from '../features/stripe/stripeApi';
import GlobalLoader from '../services/globalLoader';

const ConnectStripeButton: React.FC = () => {
  const [createAccount, { isLoading }] = useCreateStripeExpressAccountMutation();

  const handleConnect = async () => {
    try {
      const response = await createAccount().unwrap();

      if (response?.url) {
        window.location.href = response.url; // ✅ التوجيه إلى رابط Stripe
      } else {
        console.error('❌ Registration link not received from Stripe.')
      }
    } catch (error: any) {
      console.error('❌ An error occurred while connecting to Stripe:', error);
      alert('An error occurred while connecting with Stripe. Please try again.');
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
    >
      {isLoading ? <GlobalLoader /> : 'Join with Stripe'}
    </button>
  );
};

export default ConnectStripeButton;
