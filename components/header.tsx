// components/header.tsx
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getAuthUser } from "@/lib/auth";
import LogoutButton from "./logout-button";

export default async function Header() {
  // ✅ Server-side - no useState/useEffect needed
  const user = await getAuthUser();

  return (
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
      <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href="/">
          <Image
            src="/logo2.png"
            width={200}
            height={60}
            alt="logo"
            loading="eager"
            className='py-1 object-contain'
            style={{ height: '3rem', width: 'auto' }}
          />
        </Link>

        <div className='flex items-center space-x-2 md:space-x-4'>
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="cursor-pointer px-2.5 py-4.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:block">Industry Insights</span>
                </Button>
              </Link>

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
                    <Link href="/interview" className='flex items-center gap-2'>
                      <GraduationCap className='h-4 w-4' />
                      <span>Interview Prep</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar */}
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
                  <DropdownMenuItem className="p-2">
                    <LogoutButton />
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