
import React from 'react';
import { Outlet } from 'react-router-dom';

const FormLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center py-8">
        <Outlet />
      </div>
      {/* Footer has been removed from here since it's already included in AppLayout */}
    </div>
  );
};

export default FormLayout;
