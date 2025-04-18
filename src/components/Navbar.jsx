import { useState } from "react";
import Image from "./Image";
// import Image from "./Image";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="w-full h-16 md:h-20 flex items-center justify-between">

      {/* LOGO */}
      <Link to="/" className="flex items-center gap-4 text-2xl font-bold">
        <Image
          path="/default-image.jpg"
          alt="Marlon's logo"
          w={64}
          h={64}
        />
        <span>Marlon Castro</span>
      </Link>

      {/* MOBILE MENU */}
      <div className="md:hidden z-10">

        {/* MOBILE BUTTON */}
        <div
          className="cursor-pointer text-4xl"
          onClick={() => setOpenMenu((prev) => !prev)}
        >
          <div className="flex flex-col gap-[5.4px]">
            <div className={`h-[3px] rounded-md w-6 bg-black origin-left transition-all ease-in-out ${openMenu && "rotate-45"}`} />
            <div className={`h-[3px] rounded-md w-6 bg-black transition-all ease-in-out ${openMenu && "opacity-0"}`} />
            <div className={`h-[3px] rounded-md w-6 bg-black origin-left transition-all ease-in-out ${openMenu && "-rotate-45"}`} />
          </div>
        </div>

        {/* MOBILE LINK LIST */}
        <div
          className={`w-[100vw] h-screen bg-[#e6e6ff] flex flex-col items-center justify-center gap-8 font-medium text-lg fixed top-16 transition-all ease-in-out ${openMenu ? "-right-0" : "-right-[100%]"}`}
        >
          <Link to="/" onClick={() => setOpenMenu(false)}>Home</Link>
          <Link to="/posts?sort=trending" onClick={() => setOpenMenu(false)}>Trending</Link>
          <Link to="/posts?sort=popular" onClick={() => setOpenMenu(false)}>Most Popular</Link>
          <Link to="/" onClick={() => setOpenMenu(false)}>About</Link>
          <Link to="/login" onClick={() => setOpenMenu(false)}>
            <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">
              Login 👋
            </button>
          </Link>
        </div>
      </div>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-8 xl:gap-12 font-medium">
        <Link to="/">Home</Link>
        <Link to="/posts?sort=trending">Trending</Link>
        <Link to="/posts?sort=popular">Most Popular</Link>
        <Link to="/">About</Link>
        <SignedOut>
          <Link to="/login">
            <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">
              Login 👋
            </button>
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

export default Navbar;
