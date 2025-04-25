import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

const Navbar = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const name = user?.firstName + " " + user?.lastName;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-100 shadow-sm rounded-b-xl">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-3 bg-white text-sm text-gray-600 rounded-full px-4 py-2 shadow-inner ring-1 ring-gray-200 w-[250px]">
        <Image src="/search.png" alt="Search" width={16} height={16} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent outline-none placeholder:text-gray-400"
        />
      </div>

      {/* ICONS & USER INFO */}
      <div className="flex items-center gap-6">
        {/* Message Icon */}
        <div className="relative w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-purple-100 cursor-pointer transition">
          <Image src="/message.png" alt="Messages" width={20} height={20} />
        </div>

        {/* Notification Icon */}
        <div className="relative w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-purple-100 cursor-pointer transition">
          <Image src="/announcement.png" alt="Announcements" width={20} height={20} />
          <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-[10px] font-semibold">
            1
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-gray-700">jane</span>
          <span className="text-xs text-gray-500">{role}</span>
        </div>

        {/* User Avatar (Clerk Button) */}
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
