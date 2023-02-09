import { outrospectionToQueries } from "./converters.ts";
import { queryCollectionToPostmanCollection } from "./format.ts";
import { fetchIntrospection } from "./lib.ts";
import { outrospect } from "./outrospector.ts";
import { Header } from "./format.ts";

export { outrospect };

export async function createPostmanCollection(
  url: string,
  requestHeaders: Header[]
) {
  const introspection = await fetchIntrospection(url, requestHeaders);
  const outrospection = outrospect(introspection);
  const queryCollection = outrospectionToQueries(outrospection);
  const postmanCollection = queryCollectionToPostmanCollection(
    queryCollection,
    url,
    requestHeaders,
  );
  return { postmanCollection, outrospection, introspection };
}
