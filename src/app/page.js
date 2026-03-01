import Home from "@/components/home/Home";
import { trackVisitorPageView } from "@/actions/analytics";

function toQueryString(searchParams) {
  if (!searchParams || typeof searchParams !== "object") return null;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && String(item).trim()) params.append(key, String(item));
      });
      continue;
    }

    if (value != null && String(value).trim()) {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString || null;
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  await trackVisitorPageView({
    pageType: "home",
    routePath: "/",
    queryString: toQueryString(resolvedSearchParams),
  });

  return <Home />;
}
