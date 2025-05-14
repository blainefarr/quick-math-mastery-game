
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FormProvider, useForm } from "react-hook-form";
import Footer from '@/components/common/Footer';

const FormLayout = () => {
  // Create a default form instance that will be used by any form components
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </FormProvider>
  );
};

export default FormLayout;
