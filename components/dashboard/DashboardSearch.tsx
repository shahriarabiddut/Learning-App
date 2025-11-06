"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, X, Loader2 } from "lucide-react";
import { NAV_LINKS } from "@/lib/data/menu";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { hasPermission } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SearchResult = {
  type: "navlink" | "user";
  name: string;
  href?: string;
  icon?: React.ElementType;
  email?: string;
  image?: string;
  price?: number;
  isactive?: boolean;
  stock?: number;
};

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

export function DashboardSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Memoize filtered nav links by permission (supports both string and array permissions)
  const filteredNavLinks = useMemo(() => {
    if (!session?.user?.role) return [];

    return NAV_LINKS.filter((link) => {
      return checkPermissions(session.user.role as UserRole, link.permission);
    }).map((link) => {
      if (link.children) {
        const kids = link.children.filter((child) => {
          return checkPermissions(
            session.user.role as UserRole,
            child.permission
          );
        });
        return { ...link, children: kids };
      }
      return link;
    });
  }, [session?.user?.role]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Collapse when clicking outside
  useEffect(() => {
    function onDocumentMouseDown(e: MouseEvent) {
      if (
        isExpanded &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
        setQuery("");
        setResults([]);
      }
    }
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, [isExpanded]);

  // Handle search with debouncing for user search
  const handleSearch = useCallback(
    async (searchTerm: string) => {
      const trimmedTerm = searchTerm.trim().toLowerCase();

      if (!trimmedTerm) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      const [prefix, ...rest] = trimmedTerm.split(" ");
      const actualQuery = rest.join(" ") || prefix;

      const isNavLinkSearch = ["link", "menu", "nav"].includes(prefix);
      const isUserSearch = ["user", "users", "u"].includes(prefix);

      // NAV_LINK search on filteredNavLinks
      if (!isUserSearch) {
        const navMatches: SearchResult[] = [];
        const keywordMatch = (target: string, input: string) => {
          const targetLower = target.toLowerCase();
          const inputLower = input.toLowerCase();

          // Exact match or starts with
          if (targetLower.includes(inputLower)) return true;

          // Character-by-character match
          const inputChars = inputLower.split("").filter(Boolean);
          return inputChars.every((char) => targetLower.includes(char));
        };

        filteredNavLinks.forEach((link) => {
          if (keywordMatch(link.name, actualQuery)) {
            navMatches.push({
              type: "navlink",
              name: link.name,
              href: link.href,
              icon: link.icon,
            });
          }
          link.children?.forEach((child) => {
            if (keywordMatch(child.name, actualQuery)) {
              navMatches.push({
                type: "navlink",
                name: child.name,
                href: child.href,
                icon: child.icon,
              });
            }
          });
        });

        if (navMatches.length > 0 || isNavLinkSearch) {
          setResults(navMatches);
          setIsLoading(false);
          return;
        }
      }

      // USER search
      if (isUserSearch) {
        setIsLoading(true);
        try {
          const userResponse = await fetch(
            `/api/users/search?q=${encodeURIComponent(actualQuery)}`
          );
          if (userResponse.ok) {
            const users = await userResponse.json();
            setResults(
              users.map((user: any) => ({
                type: "user",
                name: user.name,
                email: user.email,
                image: user.image,
                href: `/dashboard/users?search=${encodeURIComponent(
                  user.email
                )}`,
              }))
            );
          } else {
            toast.error("Failed to fetch users");
            setResults([]);
          }
        } catch (error) {
          toast.error("Error fetching users!");
          setResults([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setResults([]);
      setIsLoading(false);
    },
    [filteredNavLinks]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      setIsLoading(true);
      handleSearch(value);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsExpanded(false);
    setQuery("");
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative z-50">
      {isExpanded ? (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search links, users..."
              className="w-[250px] md:w-[350px] pl-9 pr-9 h-10 rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              value={query}
              onChange={handleInputChange}
              ref={inputRef}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-accent"
                onClick={handleClear}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {(results.length > 0 || isLoading) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border-2 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-96 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
                    <SearchIcon className="h-8 w-8 opacity-50" />
                    <span className="text-sm">No results found</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <Link
                        key={`${result.type}-${index}`}
                        href={result.href || "#"}
                        target={result.type === "user" ? "_blank" : "_self"}
                        onClick={handleResultClick}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                          "hover:bg-primary/10 hover:scale-[1.02] hover:shadow-sm",
                          "focus:outline-none focus:bg-primary/10 focus:scale-[1.02]"
                        )}
                      >
                        {/* User result */}
                        {result.type === "user" && (
                          <>
                            {result.image ? (
                              <Image
                                src={result.image}
                                alt={result.name}
                                width={40}
                                height={40}
                                className="rounded-full ring-2 ring-background shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-background shadow-sm">
                                <span className="text-sm font-semibold text-primary">
                                  {result.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">
                                {result.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {result.email}
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                              User
                            </div>
                          </>
                        )}

                        {/* Navlink result */}
                        {result.type === "navlink" && (
                          <>
                            <div className="p-2 rounded-lg bg-accent/50">
                              {result.icon && (
                                <result.icon className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <span className="font-medium text-sm flex-1">
                              {result.name}
                            </span>
                            <div className="px-2 py-1 bg-accent/50 text-muted-foreground text-xs font-medium rounded-full">
                              Link
                            </div>
                          </>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Tips */}
              {!isLoading && results.length === 0 && query && (
                <div className="border-t bg-accent/30 p-3">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Tip: Try{" "}
                    <span className="font-semibold">user &lt;name&gt;</span> to
                    search users
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent/50 transition-all hover:scale-110"
          onClick={() => setIsExpanded(true)}
          title="Search"
        >
          <SearchIcon className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      )}
    </div>
  );
}
