"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO } from "@/lib/data/catalog";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(media.matches);
      if (media.matches) {
        videoRef.current?.pause();
        setPlaying(false);
      }
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#1a120c] text-[#f7f1e8]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay={!reduced}
        muted
        loop
        playsInline
        poster={HERO_VIDEO.poster}
        aria-label={`${HERO_VIDEO.title}, film by ${HERO_VIDEO.author}`}
      >
        <source src={HERO_VIDEO.src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-white/80">Furniture for unhurried rooms</p>
        <h1 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
          Made to be lived with.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
          Solid oak, linen, and a little ember light. Pieces that settle into a home and stay there.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f7f1e8] px-6 text-sm font-medium text-[#241c15] transition hover:bg-white active:scale-[0.98]"
          >
            Shop the collection
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.98]"
          >
            Try the demo
          </Link>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-xs text-white/80">
        <a className="underline-offset-2 hover:underline" href={HERO_VIDEO.source}>
          Film: {HERO_VIDEO.author} on Pexels
        </a>
        <button
          type="button"
          onClick={toggle}
          title={playing ? "Pause film" : "Play film"}
          className="rounded-full border border-white/30 px-3 py-1.5 transition hover:bg-white/10 active:scale-95"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </section>
  );
}
