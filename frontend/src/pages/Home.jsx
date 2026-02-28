import React, { useEffect } from 'react';
import useFetch from '../hooks/useFetch';

const Home = () => {
  const { data, loading, error, request } = useFetch();

  useEffect(() => {
    // Attempt to hit a backend route.
    request({ url: '/users/current-user', method: 'GET' });
  }, [request]);

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Home</h1>
      <p className="text-gray-600 mb-6">Welcome to PlayHub frontend!</p>
      
      <div className="p-4 bg-white shadow rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">API Connection Test</h2>
        {loading && <p className="text-blue-600 animate-pulse">Testing connection to backend...</p>}
        {error && <p className="text-red-500 bg-red-50 p-3 rounded-md border border-red-200">Error: {error}</p>}
        {data && (
          <div className="text-green-600 bg-green-50 p-3 rounded-md border border-green-200 overflow-x-auto">
            <p className="font-medium mb-1">Successfully reached backend!</p>
            <pre className="text-xs text-green-800 mt-2">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
