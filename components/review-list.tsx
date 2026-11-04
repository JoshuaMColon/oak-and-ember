"use client";

import { useState, type FormEvent } from "react";
import { useLocal, writeLocal } from "@/lib/browser-store";
import type { Review } from "@/lib/types";

const KEY = "oak-ember-reviews";

export function ReviewList({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const stored = useLocal<Record<string, Review[]>>(KEY, {});
  const extra = stored[productId] ?? [];
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [note, setNote] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (author.trim().length < 2 || body.trim().length < 8) {
      setNote("Add your name and a few words.");
      return;
    }
    const review: Review = {
      id: `local-${Date.now()}`,
      author: author.trim(),
      rating,
      title: title.trim() || "A note from the house",
      body: body.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const all = { ...stored, [productId]: [review, ...extra] };
    writeLocal(KEY, all);
    setTitle("");
    setBody("");
    setNote("Saved on this device. Signed-in reviews are stored in Supabase when it is connected.");
  }

  const allReviews = [...extra, ...reviews];

  return (
    <section className="mt-16">
      <h2 className="font-serif text-3xl">Reviews</h2>
      {allReviews.length === 0 ? (
        <p className="mt-3 text-muted">No reviews yet. Be the first to write from the room it landed in.</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {allReviews.map((review) => (
            <li key={review.id} className="border-b border-line pb-6">
              <p className="text-sm" aria-label={`${review.rating} out of 5 stars`}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              <h3 className="mt-1 font-medium">{review.title}</h3>
              <p className="mt-2 leading-7">{review.body}</p>
              <p className="mt-2 text-xs text-muted">
                {review.author} · {review.createdAt}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-8 max-w-xl space-y-3 rounded-3xl border border-line bg-surface p-5">
        <h3 className="font-serif text-2xl">Write a review</h3>
        <label className="block text-sm">
          Name
          <input value={author} onChange={(event) => setAuthor(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-background px-3" required />
        </label>
        <label className="block text-sm">
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-background px-3" />
        </label>
        <fieldset>
          <legend className="text-sm">Rating</legend>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="cursor-pointer" title={`${value} star${value > 1 ? "s" : ""}`}>
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  className="sr-only"
                />
                <span className={value <= rating ? "text-ember" : "text-line"} aria-hidden="true">★</span>
                <span className="sr-only">{value} stars</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm">
          Review
          <textarea value={body} onChange={(event) => setBody(event.target.value)} required rows={4} className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2" />
        </label>
        <button type="submit" className="h-11 rounded-full bg-ink px-5 text-sm text-background transition hover:opacity-90 active:scale-[0.98]">
          Publish review
        </button>
        {note ? <p className="text-sm text-muted" role="status">{note}</p> : null}
      </form>
    </section>
  );
}

