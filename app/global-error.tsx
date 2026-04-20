"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="screen-shell" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#6b7a84", marginBottom: "1.5rem" }}>
            An unexpected error occurred.
          </p>
          <button className="primary-button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
