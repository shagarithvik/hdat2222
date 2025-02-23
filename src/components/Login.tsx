import React, { useState } from 'react';

interface LoginProps {
  onLogin: (licenseKey: string) => void;
  darkMode: boolean;
}

function Login({ onLogin, darkMode }: LoginProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');

  const validateLicenseKey = (key: string): boolean => {
    // Check if the key matches the format: LEARN-AI-XXXXX-XXXXX-XXXXX-XXXXX
    // where X can be uppercase letters or numbers
    const pattern = /^LEARN-AI-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
    return pattern.test(key);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLicenseKey(licenseKey)) {
      setError('');
      onLogin(licenseKey);
    } else {
      setError('Invalid license key format. Please check your key and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            LEARN.AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your license key to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="license-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              License Key
            </label>
            <input
              id="license-key"
              type="text"
              required
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value.toUpperCase());
                setError('');
              }}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="LEARN-AI-XXXXX-XXXXX-XXXXX-XXXXX"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Format: LEARN-AI-XXXXX-XXXXX-XXXXX-XXXXX (where X is a letter or number)
            </p>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;