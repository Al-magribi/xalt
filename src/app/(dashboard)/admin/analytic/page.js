import { getAdminAnalyticsData } from "@/actions/analytics";
import Analytic from "@/components/admin/analytic/Analytic";

function toSafePage(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

export default async function AdminAnalyticPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = toSafePage(resolvedSearchParams?.page);

  const data = await getAdminAnalyticsData({
    leadLimit: 10,
    leadPage: page,
    eventLimit: 10,
  });

  return <Analytic data={data} />;
}
