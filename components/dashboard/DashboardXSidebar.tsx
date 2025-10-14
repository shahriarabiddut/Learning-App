"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NAV_LINKS } from "@/lib/data/menu";
import { hasPermission } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import {
  selectSidebarCollapsed,
  toggleSidebarCollapsed,
} from "@/lib/redux-features/theme/theme-slice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { cn } from "@/lib/utils";
import { Session } from "better-auth";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SidebarSeparator } from "../ui/sidebar";

interface SidebarProps {
  session: Session;
}

export function DashboardXSidebar({ session }: SidebarProps) {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(selectSidebarCollapsed);

  // Handle sidebar toggle
  const onCollapse = () => {
    dispatch(toggleSidebarCollapsed());
  };

  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Memoize filtered links to prevent re-computation and infinite re-renders
  const filteredLinks = useMemo(() => {
    return NAV_LINKS.filter((link) => {
      if (!link.permission) return true;
      return hasPermission(session?.user?.role as UserRole, link.permission);
    }).map((link) => {
      if (link.children) {
        const filteredChildren = link.children.filter((child) => {
          if (!child.permission) return true;
          return hasPermission(
            session?.user?.role as UserRole,
            child.permission
          );
        });
        return { ...link, children: filteredChildren };
      }
      return link;
    });
  }, [session?.user?.role]);

  // Close all dropdowns when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdowns({});
    }
  }, [isCollapsed]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auto-expand parent if child is active (memoized to prevent infinite re-renders)
  useEffect(() => {
    if (!isCollapsed) {
      const activeParent = filteredLinks.find((item) => {
        if (!item.children) return false;
        return item.children.some((child) => pathname.startsWith(child.href));
      });

      if (activeParent) {
        setOpenDropdowns({ [activeParent.name]: true });
      }
    }
  }, [pathname, isCollapsed, filteredLinks]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (name: string) => {
    if (isCollapsed) return;

    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = !!prev[name];
      return isCurrentlyOpen ? {} : { [name]: true };
    });
  };

  const handleMouseEnter = (name: string) => {
    if (isCollapsed) {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      const timeout = setTimeout(() => {
        setOpenDropdowns((prev) => ({ ...prev, [name]: true }));
      }, 200);
      setHoverTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    if (isCollapsed) {
      setOpenDropdowns({});
    }
  };

  const isActive = (href?: string, children?: { href: string }[]) => {
    if (href && pathname === href) return true;
    if (children) {
      return children.some((child) => pathname.startsWith(child.href));
    }
    return false;
  };

  const hasActiveChild = (children?: { href: string }[]) => {
    if (!children) return false;
    return children.some((child) => pathname.startsWith(child.href));
  };

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background shadow-md"
          title="View Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Full-Screen Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-60 w-80 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        ref={sidebarRef}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h2 className="text-lg font-semibold">Dashboard Panel</h2>
          <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {filteredLinks.map((item) => {
              const itemIsActive = isActive(item.href, item.children);
              const isDropdownOpen = openDropdowns[item.name];
              const hasActiveChildren = hasActiveChild(item.children);

              if (item.children) {
                return (
                  <li key={item.name}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        itemIsActive || hasActiveChildren
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => toggleDropdown(item.name)}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </div>
                      {isDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    {isDropdownOpen && (
                      <ul className="ml-6 space-y-1 mt-2">
                        {item.children.map((child) => {
                          const isChildActive = pathname.startsWith(child.href);
                          return (
                            <li key={child.name}>
                              <Link href={child.href} onClick={closeMobileMenu}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start px-4 py-2 text-sm",
                                    isChildActive
                                      ? "bg-accent text-accent-foreground"
                                      : "hover:bg-accent"
                                  )}
                                >
                                  {child.icon && (
                                    <child.icon className="h-4 w-4 mr-2" />
                                  )}
                                  {child.name}
                                </Button>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link href={item.href || "#"} onClick={closeMobileMenu}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        itemIsActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out sticky top-0 h-screen overflow-y-auto",
          isCollapsed ? "w-20" : "w-64"
        )}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && <h2 className="text-lg">Dashboard Panel</h2>}
          <Button variant="ghost" size="icon" onClick={onCollapse}>
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <SidebarSeparator />
        <nav className="flex-1 px-2 pt-3">
          <ul className="space-y-1">
            {filteredLinks.map((item) => {
              const itemIsActive = isActive(item.href, item.children);
              const isDropdownOpen = openDropdowns[item.name];
              const hasActiveChildren = hasActiveChild(item.children);

              if (item.children) {
                return (
                  <li
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                  >
                    {isCollapsed ? (
                      <Popover
                        open={openDropdowns[item.name]}
                        onOpenChange={(open) =>
                          setOpenDropdowns((prev) =>
                            open ? { ...prev, [item.name]: true } : {}
                          )
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-center px-0 rounded-lg py-2 text-sm font-medium transition-colors ",
                              itemIsActive || hasActiveChildren
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                            title={item.name}
                          >
                            <item.icon className="h-5 w-5 -ml-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="right"
                          className="w-48 p-0 ml-2"
                        >
                          <div className="py-1 ">
                            <div className="px-3 py-2 text-sm font-medium border-b">
                              {item.name}
                            </div>
                            {item.children.map((child) => (
                              <Link key={child.name} href={child.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start px-4 py-2 text-sm",
                                    pathname.startsWith(child.href)
                                      ? "bg-accent text-accent-foreground"
                                      : "hover:bg-accent"
                                  )}
                                >
                                  {child.icon && (
                                    <child.icon className="h-4 w-4 mr-2" />
                                  )}
                                  {child.name}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            itemIsActive || hasActiveChildren
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                          onClick={() => toggleDropdown(item.name)}
                        >
                          <div className="flex items-center">
                            <item.icon className="h-5 w-5 mr-4.5" />
                            {item.name}
                          </div>
                          {isDropdownOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        {isDropdownOpen && (
                          <ul className="ml-6 space-y-1 mt-1">
                            {item.children.map((child) => {
                              const isChildActive = pathname.startsWith(
                                child.href
                              );
                              return (
                                <li key={child.name}>
                                  <Link href={child.href}>
                                    <Button
                                      variant="ghost"
                                      className={cn(
                                        "w-full justify-start px-4 py-1 text-sm",
                                        isChildActive
                                          ? "bg-accent text-accent-foreground"
                                          : "hover:bg-accent"
                                      )}
                                    >
                                      {child.icon && (
                                        <child.icon className="h-4 w-4 mr-3" />
                                      )}
                                      {child.name}
                                    </Button>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link href={item.href || "#"}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        itemIsActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {!isCollapsed && item.name}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
