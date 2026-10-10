import { cacheLife } from "next/cache";
import { FooterContent } from "./FooterContent";

/** `new Date()` would fail prerendering under Cache Components unless it runs inside a cache scope. */
export async function Footer() {
  "use cache";
  cacheLife("days");

  return <FooterContent year={new Date().getFullYear()} />;
}
