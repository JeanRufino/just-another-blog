import { useState } from "react";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <section className="w-full h-16 md:h-20 flex items-center justify-between">
      <div className="text-2xl font-bold">
        Marlon Castro
      </div>

      <div className="md:hidden">
        <div className="cursor-pointer" onClick={() => setOpenMenu(!openMenu)}>
          {openMenu ? 'X' : '☰'}
        </div>
        <div className="w-full h-screen flex flex-col items-center justify-center absolute top-16 back">

        </div>
        {/* Sobre (Intro?)
        Autor
        Ritalinha
        Contato (somente e-mail) */}
      </div>

      <div className="hidden md:flex">
        {/* Sobre (Intro?)
        Autor
        Ritalinha
        Contato (somente e-mail) */}
      </div>

      {/* (Assine) (LinkedIn Link) (Substack Link) */}
    </section>
  );
}

export default Navbar;
