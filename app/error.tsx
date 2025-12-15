"use client";

export default function GlobalError({ error }: { error: unknown }) {
  console.error(error);
  return <div>Something went wrong</div>;
}
