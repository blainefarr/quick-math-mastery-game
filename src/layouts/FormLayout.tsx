
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FormProvider, useForm } from "react-hook-form";

const FormLayout = () => {
  // Create a default form instance that will be used by any form components
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <Outlet />
    </FormProvider>
  );
};

export default FormLayout;
