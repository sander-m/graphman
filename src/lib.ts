import {
  getIntrospectionQuery,
  IntrospectionObjectType,
  IntrospectionQuery,
} from "https://esm.sh/v90/graphql@16.5.0";
import { Header } from "./format.ts";

async function query(url: string, query: string, requestHeaders: Header[]) { 
  requestHeaders.push({key: "Content-Type", value: "application/json"})
  requestHeaders.push({key: "Accept", value: "application/json"})

  const headerRecord: Record<string, string> = {}

  requestHeaders.forEach(header => {
    headerRecord[header.key] = header.value
  });
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headerRecord,
      body: JSON.stringify({
        query,
      }),
    });
    return await res.json();
  } catch {
    throw new Error(
      "\n\nError fetching introspection query. \n Please verify your URL, authorization, and network connection.\n",
    );
  }
}

// deno-lint-ignore no-explicit-any
export function saveJsonFormatted(json: any, path: string) {
  Deno.writeTextFileSync(path, JSON.stringify(json, null, "\t"), {
    create: true,
  });
}

export async function fetchIntrospection(url: string, requestHeaders: Header[]) {
  const introspectionQueryString = getIntrospectionQuery();
  const introspection = await query(
    url,
    introspectionQueryString,
    requestHeaders,
  );
  if (!introspection.data) {
    throw new Error(
      "\n\nError fetching introspection query. \n Please verify your URL, authorization, and network connection.\n",
    );
  }
  return introspection.data as IntrospectionQuery;
}

export function getQueryAndMutationTypes(
  introspection: IntrospectionQuery,
) {
  const queryTypeName = introspection.__schema.queryType
    ? introspection.__schema.queryType.name
    : null;
  const mutationTypeName = introspection.__schema.mutationType
    ? introspection.__schema.mutationType.name
    : null;

  const queryType = introspection.__schema.types.find(
    (type) => type.name === queryTypeName,
  ) as IntrospectionObjectType | null;

  const mutationType = introspection.__schema.types.find(
    (type) => type.name === mutationTypeName,
  ) as IntrospectionObjectType | null;

  return { queryType, mutationType };
}
