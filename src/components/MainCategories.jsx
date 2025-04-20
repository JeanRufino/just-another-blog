import { Link } from "react-router-dom";
// import Search from "./Search";

const MainCategories = () => {
  return (
    <div className="hidden md:flex bg-white rounded-3xl xl:rounded-full p-4 shadow-lg items-center justify-center gap-8">

      {/* LINKS */}
      <div className="flex-1 flex items-center justify-between flex-wrap">
        <Link
          to="/posts"
          className="bg-blue-800 text-white rounded-full px-4 py-2"
        >
          Todos os Posts
        </Link>
        <Link
          to="/posts?cat=publicidade"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Publicidade
        </Link>
        <Link
          to="/posts?cat=criticas" 
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Críticas
        </Link>
        <Link
          to="/posts?cat=quimica"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Química
        </Link>
        <Link
          to="/posts?cat=literatura"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Literatura
        </Link>
        <Link
          to="/posts?cat=ruptura"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Ruptura
        </Link>
      </div>
      <span className="text-xl font-medium">|</span>

      {/* SEARCH */}
      {/* <Search/> */}
    </div>
  );
};

export default MainCategories;
