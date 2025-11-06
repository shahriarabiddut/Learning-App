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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { SidebarSeparator } from "../ui/sidebar";
import dynamic from "next/dynamic";
import FormLoadingSpinner from "@/components/shared/Loader/FormLoadingSpinner";

// Dynamic form imports
const formComponents = {
  user: dynamic(
    () =>
      import("@/components/user/UserForm").then((mod) => ({
        default: mod.UserForm,
      })),
    { loading: FormLoadingSpinner, ssr: false }
  ),
  category: dynamic(
    () =>
      import("@/components/categories/CategoryForm").then((mod) => ({
        default: mod.CategoryForm,
      })),
    { loading: FormLoadingSpinner, ssr: false }
  ),
  post: dynamic(
    () =>
      import("@/components/blogpost/BlogPostForm").then((mod) => ({
        default: mod.BlogPostForm,
      })),
    { loading: FormLoadingSpinner, ssr: false }
  ),
} as const;

type FormType = keyof typeof formComponents;

interface SidebarProps {
  session: Session;
}

// Form Manager Hook
const useFormManager = () => {
  const [currentForm, setCurrentForm] = useState<FormType | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formProps, setFormProps] = useState<Record<string, any>>({});
  const preloadedFormsRef = useRef<Set<FormType>>(new Set());

  const openForm = useCallback(
    (formType: FormType, props: Record<string, any> = {}) => {
      setCurrentForm(formType);
      setFormProps(props);
      setIsFormOpen(true);
    },
    []
  );

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setCurrentForm("");
    setFormProps({});
  }, []);

  const preloadForm = useCallback((formType: FormType) => {
    if (preloadedFormsRef.current.has(formType)) return;
    preloadedFormsRef.current.add(formType);
    const component = formComponents[formType];
    if (component && typeof component.preload === "function") {
      component.preload();
    }
  }, []);

  return {
    currentForm,
    isFormOpen,
    formProps,
    openForm,
    closeForm,
    preloadForm,
  };
};

// Dynamic Form Renderer
const DynamicFormRenderer = memo(
  ({
    formType,
    isOpen,
    onOpenChange,
    formProps,
  }: {
    formType: FormType;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formProps?: Record<string, any>;
  }) => {
    if (!isOpen || !formType) return null;
    const FormComponent = formComponents[formType];

    return (
      <FormComponent open={isOpen} onOpenChange={onOpenChange} {...formProps} />
    );
  }
);

DynamicFormRenderer.displayName = "DynamicFormRenderer";

// Multi-permission checker
const checkPermissions = (
  userRole: UserRole,
  permission?: string | string[]
): boolean => {
  if (!permission) return true;

  if (Array.isArray(permission)) {
    return permission.some((perm) => hasPermission(userRole, perm));
  }

  return hasPermission(userRole, permission);
};

export function DashboardXSidebar({ session }: SidebarProps) {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(selectSidebarCollapsed);
  const pathname = usePathname();
  const router = useRouter();

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Form management
  const {
    currentForm,
    isFormOpen,
    formProps,
    openForm,
    closeForm,
    preloadForm,
  } = useFormManager();

  const onCollapse = useCallback(() => {
    dispatch(toggleSidebarCollapsed());
  }, [dispatch]);

  // Memoize filtered links
  const filteredLinks = useMemo(() => {
    return NAV_LINKS.filter((link) => {
      return checkPermissions(session?.user?.role as UserRole, link.permission);
    }).map((link) => {
      if (link.children) {
        const filteredChildren = link.children.filter((child) => {
          return checkPermissions(
            session?.user?.role as UserRole,
            child.permission
          );
        });
        return { ...link, children: filteredChildren };
      }
      return link;
    });
  }, [session?.user?.role]);

  // Close dropdowns when sidebar collapses
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

  // Auto-expand parent if child is active
  useEffect(() => {
    if (!isCollapsed) {
      const activeParent = filteredLinks.find((item) => {
        if (!item.children) return false;
        return item.children.some((child) =>
          pathname.startsWith(child.href || "")
        );
      });

      if (activeParent) {
        setOpenDropdowns({ [activeParent.name]: true });
      }
    }
  }, [pathname, isCollapsed, filteredLinks]);

  useEffect(() => setHasMounted(true), []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleDropdown = useCallback(
    (name: string) => {
      if (isCollapsed) return;
      setOpenDropdowns((prev) => {
        const isCurrentlyOpen = !!prev[name];
        return isCurrentlyOpen ? {} : { [name]: true };
      });
    },
    [isCollapsed]
  );

  const handleMouseEnter = useCallback(
    (name: string) => {
      if (isCollapsed) {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        const timeout = setTimeout(() => {
          setOpenDropdowns((prev) => ({ ...prev, [name]: true }));
        }, 150);
        setHoverTimeout(timeout);
      }
    },
    [isCollapsed, hoverTimeout]
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    if (isCollapsed) {
      setOpenDropdowns({});
    }
  }, [hoverTimeout, isCollapsed]);

  const isActive = useCallback(
    (href?: string, children?: any[]) => {
      if (href && pathname === href) return true;
      if (children) {
        return children.some((child) => pathname.startsWith(child.href || ""));
      }
      return false;
    },
    [pathname]
  );

  const hasActiveChild = useCallback(
    (children?: any[]) => {
      if (!children) return false;
      return children.some((child) => pathname.startsWith(child.href || ""));
    },
    [pathname]
  );

  const handleChildClick = useCallback(
    (child: any) => {
      if (child.action && child.form) {
        openForm(child.form as FormType);
      } else if (child.href) {
        router.push(child.href);
      }
      closeMobileMenu();
    },
    [openForm, router, closeMobileMenu]
  );

  const handleChildHover = useCallback(
    (child: any) => {
      if (child.form && child.action) {
        preloadForm(child.form as FormType);
      }
    },
    [preloadForm]
  );

  if (!hasMounted) return null;

  return (
    <>
      {/* Dynamic Form Renderer */}
      {currentForm && (
        <div className="z-[60]">
          <DynamicFormRenderer
            formType={currentForm as FormType}
            isOpen={isFormOpen}
            onOpenChange={(open) => {
              if (!open) closeForm();
            }}
            formProps={formProps}
          />
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background/95 backdrop-blur-sm shadow-lg border-2 hover:scale-105 transition-transform"
          title={mobileMenuOpen ? "Close Menu" : "Open Menu"}
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
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Full-Screen Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-80 bg-background/95 backdrop-blur-md border-r shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        ref={sidebarRef}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b bg-background/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileMenu}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1.5">
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
                        "w-full justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                        itemIsActive || hasActiveChildren
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "hover:bg-accent/50 hover:scale-[1.02]"
                      )}
                      onClick={() => toggleDropdown(item.name)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      {isDropdownOpen ? (
                        <ChevronUp className="h-4 w-4 transition-transform" />
                      ) : (
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      )}
                    </Button>
                    {isDropdownOpen && (
                      <ul className="ml-4 space-y-1 mt-1.5 animate-in slide-in-from-top-2 duration-200">
                        {item.children.map((child) => {
                          const isChildActive = pathname.startsWith(
                            child.href || ""
                          );
                          return (
                            <li
                              key={child.name}
                              onMouseEnter={() => handleChildHover(child)}
                            >
                              {child.action && child.form ? (
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start px-4 py-2 text-sm rounded-lg transition-all",
                                    isChildActive
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "hover:bg-accent/50 hover:translate-x-1"
                                  )}
                                  onClick={() => handleChildClick(child)}
                                >
                                  {child.icon && (
                                    <child.icon className="h-4 w-4 mr-3" />
                                  )}
                                  {child.name}
                                </Button>
                              ) : (
                                <Link
                                  href={child.href || "#"}
                                  onClick={closeMobileMenu}
                                >
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-start px-4 py-2 text-sm rounded-lg transition-all",
                                      isChildActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-accent/50 hover:translate-x-1"
                                    )}
                                  >
                                    {child.icon && (
                                      <child.icon className="h-4 w-4 mr-3" />
                                    )}
                                    {child.name}
                                  </Button>
                                </Link>
                              )}
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
                        "w-full justify-start rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                        itemIsActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "hover:bg-accent/50 hover:scale-[1.02]"
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
          "hidden md:flex flex-col border-r bg-background/50 backdrop-blur-sm transition-all duration-300 ease-in-out sticky top-0 h-screen overflow-y-auto shadow-sm",
          isCollapsed ? "w-20" : "w-64"
        )}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b bg-background/30">
          {!isCollapsed && (
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="hover:bg-accent/50 transition-all hover:scale-110"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <SidebarSeparator />
        <nav className="flex-1 px-2.5 pt-4">
          <ul className="space-y-1.5">
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
                              "w-full justify-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                              itemIsActive || hasActiveChildren
                                ? "bg-primary/10 text-primary shadow-sm scale-105"
                                : "hover:bg-accent/50 hover:scale-105"
                            )}
                            title={item.name}
                          >
                            <item.icon className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="right"
                          className="w-56 p-1.5 ml-2 border-2 shadow-xl"
                        >
                          <div className="space-y-1">
                            <div className="px-3 py-2.5 text-sm font-bold border-b bg-accent/30 rounded-t-lg">
                              {item.name}
                            </div>
                            {item.children.map((child) => (
                              <div
                                key={child.name}
                                onMouseEnter={() => handleChildHover(child)}
                              >
                                {child.action && child.form ? (
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-start px-3.5 py-2.5 text-sm rounded-lg transition-all",
                                      pathname.startsWith(child.href || "")
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-accent/50 hover:translate-x-1"
                                    )}
                                    onClick={() => handleChildClick(child)}
                                  >
                                    {child.icon && (
                                      <child.icon className="h-4 w-4 mr-3" />
                                    )}
                                    {child.name}
                                  </Button>
                                ) : (
                                  <Link href={child.href || "#"}>
                                    <Button
                                      variant="ghost"
                                      className={cn(
                                        "w-full justify-start px-3.5 py-2.5 text-sm rounded-lg transition-all",
                                        pathname.startsWith(child.href || "")
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "hover:bg-accent/50 hover:translate-x-1"
                                      )}
                                    >
                                      {child.icon && (
                                        <child.icon className="h-4 w-4 mr-3" />
                                      )}
                                      {child.name}
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                            itemIsActive || hasActiveChildren
                              ? "bg-primary/10 text-primary shadow-sm"
                              : "hover:bg-accent/50 hover:scale-[1.02]"
                          )}
                          onClick={() => toggleDropdown(item.name)}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </div>
                          {isDropdownOpen ? (
                            <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                          )}
                        </Button>
                        {isDropdownOpen && (
                          <ul className="ml-4 space-y-1 mt-1.5 animate-in slide-in-from-top-2 duration-200">
                            {item.children.map((child) => {
                              const isChildActive = pathname.startsWith(
                                child.href || ""
                              );
                              return (
                                <li
                                  key={child.name}
                                  onMouseEnter={() => handleChildHover(child)}
                                >
                                  {child.action && child.form ? (
                                    <Button
                                      variant="ghost"
                                      className={cn(
                                        "w-full justify-start px-4 py-2 text-sm rounded-lg transition-all",
                                        isChildActive
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "hover:bg-accent/50 hover:translate-x-1"
                                      )}
                                      onClick={() => handleChildClick(child)}
                                    >
                                      {child.icon && (
                                        <child.icon className="h-4 w-4 mr-3" />
                                      )}
                                      {child.name}
                                    </Button>
                                  ) : (
                                    <Link href={child.href || "#"}>
                                      <Button
                                        variant="ghost"
                                        className={cn(
                                          "w-full justify-start px-4 py-2 text-sm rounded-lg transition-all",
                                          isChildActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-accent/50 hover:translate-x-1"
                                        )}
                                      >
                                        {child.icon && (
                                          <child.icon className="h-4 w-4 mr-3" />
                                        )}
                                        {child.name}
                                      </Button>
                                    </Link>
                                  )}
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
                        "w-full justify-start rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                        itemIsActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "hover:bg-accent/50 hover:scale-[1.02]",
                        isCollapsed && "justify-center"
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
