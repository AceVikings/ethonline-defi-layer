import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../lib/vincentAuth';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const { jwt } = handleAuthCallback();
        await login(jwt);
        navigate('/app');
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate('/');
      }
    };

    processCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
        <h2 className="text-2xl font-black text-gray-800">Authenticating...</h2>
        <p className="text-gray-600 mt-2">Please wait while we connect your Vincent Wallet</p>
      </div>
    </div>
  );
}
