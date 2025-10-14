"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { NAV_LINKS } from "@/lib/data/menu";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { hasPermission } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

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

export function DashboardSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // filter nav links by permission
  const filteredNavLinks = NAV_LINKS.filter((link) => {
    if (!link.permission) return true;
    return (
      session && hasPermission(session.user.role as UserRole, link.permission)
    );
  }).map((link) => {
    if (link.children) {
      const kids = link.children.filter((child) => {
        if (!child.permission) return true;
        return (
          session &&
          hasPermission(session.user.role as UserRole, child.permission)
        );
      });
      return { ...link, children: kids };
    }
    return link;
  });

  // focus input and run initial search
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
      handleSearch("");
    }
  }, [isExpanded]);

  // collapse when clicking outside
  useEffect(() => {
    function onDocumentMouseDown(e: MouseEvent) {
      if (
        isExpanded &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, [isExpanded]);

  const handleSearch = async (searchTerm: string) => {
    const trimmedTerm = searchTerm.trim().toLowerCase();
    if (!trimmedTerm) {
      setResults([]);
      return;
    }

    const [prefix, ...rest] = trimmedTerm.split(" ");
    const actualQuery = rest.join(" ") || prefix;

    const isNavLinkSearch = ["link", "menu"].includes(prefix);
    const isUserSearch = ["user", "users", "u"].includes(prefix);

    // NAV_LINK search on filteredNavLinks
    if (!isUserSearch) {
      const navMatches: SearchResult[] = [];
      const keywordMatch = (target: string, input: string) => {
        const inputChars = input.toLowerCase().split("").filter(Boolean);
        return inputChars.every((char) => target.toLowerCase().includes(char));
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

      if (navMatches.length > 0 || isNavLinkSearch || !query) {
        setResults(navMatches);
        return;
      }
    }

    // USER search
    if (isUserSearch) {
      try {
        const userResponse = await fetch(`/api/users/search?q=${actualQuery}`);
        if (userResponse.ok) {
          const users = await userResponse.json();
          setResults(
            users.map((user: any) => ({
              type: "user",
              name: user.name,
              email: user.email,
              image: user.image,
              href: `/dashboard/users?search=${user.email}`,
            }))
          );
          return;
        }
      } catch (error) {
        toast.error("Error fetching users!");
      }
    }

    setResults([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  return (
    <div ref={containerRef} className="relative z-50">
      {isExpanded ? (
        <div className="flex items-center">
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] md:w-[300px]"
            value={query}
            onChange={handleInputChange}
            ref={inputRef}
          />

          {results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded shadow-lg z-50 max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.href || "#"}
                  target={result.type === "user" ? "_blank" : "_self"}
                  onMouseDown={(e) => e.preventDefault()}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100"
                >
                  {/* user result */}
                  {result.type === "user" && (
                    <>
                      {result.image && (
                        <Image
                          src={result.image}
                          alt={result.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">
                          {result.email}
                        </div>
                      </div>
                    </>
                  )}

                  {/* navlink result */}
                  {result.type === "navlink" && (
                    <>
                      {result.icon && (
                        <result.icon className="h-4 w-4 text-gray-500" />
                      )}
                      <span>{result.name}</span>
                    </>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsExpanded(true)}
        >
          <SearchIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Search</span>
        </Button>
      )}
    </div>
  );
}
