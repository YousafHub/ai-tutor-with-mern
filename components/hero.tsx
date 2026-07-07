"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, type RefObject } from "react";
// import { navigateBasedOnOnboarding } from "@/actions/navigation";

export default function HeroSection() {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    if (!imageElement) return; // Guard clause for null

    const handleScroll = (): void => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="gradient gradient-title text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl">
            Your own AI Teacher for
            <br />
            Professional Success
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          {/* <form action={navigateBasedOnOnboarding}> */}
            <Button size="lg" className="px-8 !py-5 cursor-pointer">
              Get Started
            </Button>
          {/* </form> */}
          <Link href="https://www.instagram.com/yousafhub/" target="_blank">
            <Button size="lg" variant="outline" className="px-8 !py-5">
              Contact Me
            </Button>
          </Link>
        </div>

        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1080}
              height={720}
              alt="Dashboard Image"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}