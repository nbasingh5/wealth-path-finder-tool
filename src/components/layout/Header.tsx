
import React from "react";
import { HomeIcon } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center">
        <HomeIcon className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold">Rent vs. Buy Financial Comparison Tool</h1>
      </div>
    </header>
  );
};

export default Header;
