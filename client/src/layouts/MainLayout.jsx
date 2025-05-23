import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";

const MainLayout = () => {
  return (
    <div className='px-4 md:px-8 lg:px-16 lx:px-32 2lx:px-64 max-w-[100vw]'>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
