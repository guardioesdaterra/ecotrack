import Link from "next/link"; // Use Next.js Link, not react-router-dom [[6]]

export default function NotFound() {
  return (
    <div>
      <h1>Page Not Found</h1>
      <Link href="/">Return Home</Link>
    </div>
  );
}