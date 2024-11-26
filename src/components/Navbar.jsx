import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <img className="w-20 sm:w-32" src={assets.logo} alt="Logo" />
      <button
        onClick={() => setToken("")}
        className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
