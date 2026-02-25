import openapiTS, { astToString } from "openapi-typescript";

const ast = await openapiTS(
  new URL(`${process.env.NEXT_PUBLIC_API_URL}/openapi.json`, import.meta.url),
);
const contents = astToString(ast);

await Bun.write("./src/lib/apiv2/schema.d.ts", contents);

console.log("openapi.ts generated successfully");
