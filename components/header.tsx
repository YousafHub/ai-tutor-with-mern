// components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const handleNavigation = async (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50'>
        <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <Link href="/">
            <Image
              src="/logo2.png"
              width={200}
              height={60}
              alt="logo"
              className='h-12 py-1 w-auto object-contain'
            />
          </Link>
          <div className="h-10 w-20 bg-muted animate-pulse rounded"></div>
        </nav>
      </header>
    );
  }

  return (
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
      <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href="/">
          <Image
            src="/logo2.png"
            width={200}
            height={60}
            alt="logo"
            className='h-12 py-1 w-auto object-contain'
          />
        </Link>

        <div className='flex items-center space-x-2 md:space-x-4'>
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => handleNavigation("/dashboard")}
                className="cursor-pointer px-2.5 py-4.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:block">Industry Insights</span>
              </Button>

              {/* ✅ Use DropdownMenuTrigger directly - no Button inside */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-2.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
                  <StarsIcon className='h-4 w-4' />
                  <span className='hidden md:block'>Growth Tools</span>
                  <ChevronDown className='h-4 w-4' />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[180px]">
                  <DropdownMenuItem className="p-2">
                    <Link href="/resume" className='flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      <span className="inline-flex">Build Resume</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-2">
                    <Link href="/ai-cover-letter" className='flex items-center gap-2'>
                      <PenBox className='h-4 w-4' />
                      <span>Cover Letter</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-2">
                    <Link href="/interview-prep" className='flex items-center gap-2'>
                      <GraduationCap className='h-4 w-4' />
                      <span>Interview Prep</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ✅ User Avatar - no Button inside */}
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full w-10 h-10 inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <span className="text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-w-full">
                  <div className="px-4 py-2 border-b">
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer p-2">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="cursor-pointer">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="cursor-pointer">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}