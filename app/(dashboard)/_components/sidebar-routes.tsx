"use client";

import { BarChart,Bell,Compass, Heart, Layout, List } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";
import { FaChalkboardTeacher } from "react-icons/fa";

const guestRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/dashboard",
  },
  // {
  //   icon: Compass,
  //   label: "Browse",
  //   href: "/browse",
  // },
  // {
  //   icon: Heart,
  //   label: "Collections",
  //   href: "/collections/favorites",
  // },
  {
    icon: FaChalkboardTeacher,
    label: "Instructors",
    href: "/instructors",
  },
];

const teacherRoutes = [
  {
    icon: List,
    label: "Quizzes",
    href: "/teacher/quiz",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
  // {
  //   icon: Bell,
  //   label: "Announcements",
  //   href: "/teacher/announcements", 
  // }
]

export const SidebarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.includes("/teacher");

  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  )
}