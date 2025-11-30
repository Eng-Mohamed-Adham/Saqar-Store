import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSaveStripeAccountMutation } from '../features/stripe/stripeApi'; // لازم تكون مجهزة
import { setUser,updateUser } from '../features/auth/authSlice'; // لتحديث المستخدم في الواجهة

const StripeSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const accountId = params.get('accountId');
  const [saveStripeAccount] = useSaveStripeAccountMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (accountId) {
      saveStripeAccount({ stripeAccountId: accountId }).unwrap().then((updatedUser) => {
        dispatch(setUser(updatedUser)); 
      });
    }
  }, [accountId]);

  return (
    <div className="text-center p-10">
      <h2 className="text-2xl font-bold text-green-600">✅ Join To Stripe Is Successfuly</h2>
    </div>
  );
};

export default StripeSuccess;
