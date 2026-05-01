"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import { supabase } from "@/lib/supabase";

const CAMPUS_IMAGE_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCtcKqjSUj1-Mge2utuTfZmSm5DhkJhJ0d1T6WhwnOENzr4y3Pie8PxVymCw_VV5WHZFv08xcUjbRdMhAIuViCioUUsWpzzIaacJ7cgzJj78kN4UjVQbgv7DA1ROvO6b_Lru8aEZiSI4IdpNm6v7F6gcFDqfQMVdglmIslFvKV17JeKfemgSNzQY4UzIyzgDOsFq3tXjBMzXsPJB9Xe9FKKJVDkcpre2Dnym_8BaUO-pLFfUPwC0abcP7yB7bHVcgSRsANCIzVN6nU";

export default function HomePage() {
  const [counts, setCounts] = useState({ faculty: 0, departments: 0 });
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch counts
      const { data: profiles } = await supabase.from('faculty_profiles').select('department');
      if (profiles) {
        const totalFaculty = profiles.length;
        const uniqueDepts = new Set(profiles.map(p => p.department).filter(Boolean)).size;
        setCounts({ faculty: totalFaculty, departments: uniqueDepts });
      }

      // Fetch user - use getSession for faster UI update
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'faculty');
      } else {
        // Fallback check
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setRole(user.user_metadata?.role || 'faculty');
        }
      }
    }
    fetchData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'faculty');
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Only run animation if we have data
    if (counts.faculty === 0) return;

    const counters = document.querySelectorAll<HTMLElement>(".counter");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target as HTMLElement;
          const target = Number(counter.getAttribute("data-target") || 0);
          const duration = 2000; // 2 seconds
          const frameDuration = 1000 / 60; // 60fps
          const totalFrames = Math.round(duration / frameDuration);
          let frame = 0;

          const updateCount = () => {
            frame++;
            const progress = frame / totalFrames;
            // Ease out quad
            const easedProgress = progress * (2 - progress);
            const currentCount = Math.round(target * easedProgress);

            counter.innerText = currentCount.toLocaleString();

            if (frame < totalFrames) {
              requestAnimationFrame(updateCount);
            } else {
              counter.innerText = target.toLocaleString();
            }
          };

          requestAnimationFrame(updateCount);
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));

    return () => observer.disconnect();
  }, [counts.faculty, counts.departments]);

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <PublicNavbar />

      <main className="min-h-screen">
        <div className="relative flex min-h-screen flex-col lg:flex-row items-stretch pt-24 lg:pt-16">
          {/* Mobile Background Image (Seen clearly "behind" on mobile) */}
          <div className="absolute inset-0 z-0 lg:hidden">
            <Image
              src={CAMPUS_IMAGE_SRC}
              alt="University Campus Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-white/40" />
          </div>

          <section className="relative z-10 flex w-full flex-col justify-center px-4 py-8 md:px-12 lg:w-[45%] lg:bg-surface lg:px-24 lg:py-20">
            <div className="max-w-xl rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl shadow-primary/5 backdrop-blur-2xl lg:max-w-none lg:rounded-none lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
              <span className="reveal reveal-1 font-label mb-4 block text-[10px] font-bold uppercase tracking-[0.15em] text-primary md:mb-6 md:text-xs">
                Curating Academic Excellence
              </span>
              <h1 className="reveal reveal-2 font-headline mb-6 text-fluid-h1 font-extrabold leading-[1.1] tracking-tighter text-primary md:mb-8">
                Faculty & Staff
                <span className="block md:inline"> Information </span>
                <span className="inline-block hero-text-gradient">Portal.</span>
              </h1>
              <p className="reveal reveal-3 font-body mb-8 max-w-md text-base text-secondary md:mb-12 md:text-lg">
                The definitive enterprise ecosystem for engineering
                institutions to centralize, standardize, and showcase faculty
                excellence. A unified platform bridging the gap between raw
                academic data and institutional transparency
              </p>
              <div className="reveal reveal-4 mb-12 md:mb-16">
                <Link
                  href="/directory"
                  className="hero-gradient inline-flex items-center gap-3 rounded-md px-8 py-4 text-base font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-105 md:px-10 md:py-5 md:text-lg"
                >
                  <span>Access Public Directory</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-2 items-start gap-8 border-t border-outline-variant/20 pt-8 reveal reveal-4 md:gap-12 md:pt-12">
                <div className="flex flex-col">
                  <div className="font-headline mb-1 text-3xl font-extrabold tracking-tighter text-primary md:mb-2 md:text-5xl">
                    <span className="counter" data-target={counts.faculty}>
                      0
                    </span>
                    +
                  </div>
                  <div className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 md:text-xs md:tracking-[0.25em]">
                    Faculty
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-headline mb-1 text-3xl font-extrabold tracking-tighter text-primary md:mb-2 md:text-5xl">
                    <span className="counter" data-target={counts.departments}>
                      0
                    </span>
                  </div>
                  <div className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 md:text-xs md:tracking-[0.25em]">
                    Departments
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col items-center justify-center bg-surface-container px-6 py-20 lg:min-h-[800px] lg:flex-1 lg:items-end lg:bg-surface-container-high lg:px-0 lg:py-0">
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-surface-container/50 lg:hidden" />
            {/* Desktop-only Background Image */}
            <div className="absolute inset-0 z-0 hidden lg:block">
              <Image
                src={CAMPUS_IMAGE_SRC}
                alt="University Campus Architecture"
                fill
                className="bg-drift object-cover grayscale-[20%] contrast-[1.1]"
                sizes="55vw"
                priority
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent" />
            </div>

            <div className="relative z-10 flex w-full max-w-sm flex-col gap-6 lg:max-w-none lg:items-end lg:pr-24">
              <div className="group w-full max-w-sm cursor-pointer reveal reveal-3">
                <div className="card-hover-depth rounded-xl bg-surface-container-lowest/90 p-6 shadow-2xl shadow-black/5 backdrop-blur-md md:p-8">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed md:mb-6 md:h-12 md:w-12">
                    <span
                      className="material-symbols-outlined text-xl md:text-2xl"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      account_balance
                    </span>
                  </div>
                  <h3 className="font-headline mb-2 text-lg font-bold text-primary md:text-xl">
                    Faculty Login
                  </h3>
                  <p className="font-body mb-6 text-sm leading-relaxed text-secondary">
                    Access your official academic identity. Management dashboard
                    for university faculty.
                  </p>
                  <Link
                    href={user ? "/faculty/dashboard" : "/login/faculty"}
                    className="flex items-center gap-2 text-sm font-bold text-primary transition-all group hover:opacity-80 shine-button px-2 py-1 -ml-2 rounded"
                  >
                    <span>{user ? "Go to Dashboard" : "Sign In"}</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                      trending_flat
                    </span>
                  </Link>
                </div>
              </div>
              <div className="group w-full max-w-sm cursor-pointer reveal reveal-4">
                <div className="card-hover-depth card-dark-hover rounded-xl border border-white/10 bg-primary/95 p-6 shadow-2xl shadow-primary/20 backdrop-blur-md md:p-8">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white md:mb-6 md:h-12 md:w-12">
                    <span
                      className="material-symbols-outlined text-xl md:text-2xl"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      admin_panel_settings
                    </span>
                  </div>
                  <h3 className="font-headline mb-2 text-lg font-bold text-white md:text-xl">
                    Admin/HOD Login
                  </h3>
                  <p className="font-body mb-6 text-sm leading-relaxed text-blue-100">
                    Manage institutional data, approve profiles, and generate
                    reports for accreditation.
                  </p>
                  <Link
                    href={user && role === 'admin' ? "/admin/dashboard" : "/login/admin"}
                    className="flex items-center gap-2 text-sm font-bold text-white transition-all group hover:opacity-80 shine-button px-2 py-1 -ml-2 rounded"
                  >
                    <span>{user && role === 'admin' ? "Go to Dashboard" : "Sign In"}</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                      trending_flat
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 right-8 flex items-center gap-4 text-white/60 md:bottom-12 md:right-12">
              <div className="h-px w-12 bg-white/40 md:w-24" />
              <span className="font-label text-[10px] uppercase tracking-widest">
                Professional
              </span>
            </div>
          </section>
        </div>

        <div className="bg-surface-container-low px-6 py-16 md:px-12 md:py-24 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-headline mb-10 text-2xl font-bold text-primary md:mb-12 md:text-3xl">
              Key Features
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="card-hover-depth rounded-xl border border-outline-variant/20 bg-surface p-8 shadow-sm hover:border-primary/30">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <span className="material-symbols-outlined">database</span>
                </div>
                <h4 className="font-headline mb-4 text-xl font-bold text-primary">
                  Data Integrity
                </h4>
                <p className="text-sm leading-relaxed text-secondary font-body">
                  Standardized profile structures that ensure consistency.
                  Unified governance of faculty records to eliminate fragmented
                  data across departments.
                </p>
              </div>
              <div className="card-hover-depth rounded-xl border border-outline-variant/20 bg-surface p-8 shadow-sm hover:border-primary/30">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <h4 className="font-headline mb-4 text-xl font-bold text-primary">
                  Accreditation Readiness
                </h4>
                <p className="text-sm leading-relaxed text-secondary font-body">
                  Instant institutional-wide analytics providing a bird’s-eye
                  view of research output and faculty qualifications.
                </p>
              </div>
              <div className="card-hover-depth rounded-xl border border-outline-variant/20 bg-surface p-8 shadow-sm hover:border-primary/30">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <h4 className="font-headline mb-4 text-xl font-bold text-primary">
                  Global Reach
                </h4>
                <p className="text-sm leading-relaxed text-secondary font-body">
                  Expanding the boundaries of knowledge through cross-border
                  collaborations and digital accessibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
