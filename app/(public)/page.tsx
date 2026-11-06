import React from "react";
import { getPublicPortfolioData } from "@/lib/db/queries";
import PortfolioClient from "@/components/sections/PortfolioClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPublicPortfolioData();
  return <PortfolioClient data={data} />;
}

