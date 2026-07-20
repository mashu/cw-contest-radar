import type { Metadata } from "next";
import { ContestBrowser } from "@/components/ContestBrowser";

export const metadata: Metadata = {
  title: "Contests · CW Contest Radar",
  description: "Browse every CW contest with its exchange, schedule and rules.",
};

export default function ContestsPage() {
  return <ContestBrowser />;
}
