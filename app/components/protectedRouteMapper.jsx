import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// This is a higher-order component that wraps the provided component
// with authentication protection
const ProtectedRouteWrapper = (Component) => {
  const WrappedComponent = (props) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const checkUser = async () => {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        setLoading(false);
      };
      
      checkUser();
    }, []);

    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/signin" replace />;
    }

    // If authenticated, render the wrapped component
    const ActualComponent = React.lazy(() => import(Component));
    return (
      <React.Suspense fallback={<div>Loading component...</div>}>
        <ActualComponent {...props} />
      </React.Suspense>
    );
  };

  return WrappedComponent;
};

export default ProtectedRouteWrapper;