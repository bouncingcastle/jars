"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="screen-shell" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>Oops!</h1>
      <p style={{ color: "#6b7a84", marginBottom: "1.5rem" }}>
        Something went wrong. Give it another try.
      </p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
