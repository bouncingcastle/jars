"use client";

import Link from "next/link";

export default function ChildError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="screen-shell" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
      <p style={{ color: "#6b7a84", marginBottom: "1.5rem" }}>
        We hit a snag loading this page.
      </p>
      <button className="primary-button" onClick={reset} style={{ marginRight: "0.75rem" }}>
        Try again
      </button>
      <Link href="/child" className="secondary-button">
        Back to profiles
      </Link>
    </main>
  );
}
