import {assets} from "../assets/assets"

const Navbar = () => {
  return (
    <div className="flex items-center py-2 pax-[4%] justify-between">
        <img className="w-[max(10%, 80px)]" src={assets.logo} alt="" />
        <button className="bg-gray-600 text-white px-4 py-2 sm:px-2 rounded-full text-xs sm:text-sm">Logout</button>
    </div>
  )
}

export default Navbar