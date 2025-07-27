import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await axios.get(`/api/verify-email?token=${token}`);
        setStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="p-6 max-w-md mx-auto">
      {status === 'loading' && <p>Verifying email...</p>}
      {status === 'success' && <p className="text-green-600">✅ Your email has been verified! Redirecting to login...</p>}
      {status === 'error' && <p className="text-red-600">❌ Verification failed or token expired.</p>}
    </div>
  );
};

export default VerifyEmailPage;
