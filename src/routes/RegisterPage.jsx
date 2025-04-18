import { SignIn } from "@clerk/clerk-react";

SignIn
const RegisterPage = () => {
  return (
    <div className='flex items-center justify-center h-[calc(100vh-80px)]'>
      <SignIn signInUrl='/login' />
    </div>
  );
};

export default RegisterPage;
