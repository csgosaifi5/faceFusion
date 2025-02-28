"use client";

import { navLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

const Sidebar = ({ adminBlogList }: any) => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <nav className="sidebar-nav">
          <SignedIn>
            <ul className="sidebar-nav_elements">
              {navLinks.slice(0, 8).map((link) => {
                const isActive = link.route === pathname;
                if (!adminBlogList && link.label === "Blogs List") {
                  return null;
                }
                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${
                      isActive ? "bg-purple-gradient text-white" : "text-gray-700"
                    }`}
                  >
                    <Link className="sidebar-link" href={link.route}>
                      <Image
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && "brightness-200"}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="sidebar-nav_elements">
              {navLinks.slice(8).map((link) => {
                const isActive = link.route === pathname;

                if (!adminBlogList && link.label === "Blogs List") {
                  return null;
                }

                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${
                      isActive ? "bg-purple-gradient text-white" : "text-gray-700"
                    }`}
                  >
                    <Link className="sidebar-link" href={link.route}>
                      <Image
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && "brightness-200"}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SignedIn>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
