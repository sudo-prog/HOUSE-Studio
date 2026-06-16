---
name: Zod schema naming conventions
description: Orval-generated Zod schemas use specific suffixes — always verify names before importing
---

Orval codegen produces Zod schemas with specific naming conventions that don't always match intuition:

- Route **path params** → `Get{Resource}Params`, `Delete{Resource}Params`, `Send{Operation}Params`
- Route **query params** → `List{Resource}QueryParams` (has `Query` in the middle — NOT just `List{Resource}Params`)
- Request **body** → `Create{Resource}Body`, `Update{Resource}Body`, `Analyze{Resource}Body`

**Why:** The generator disambiguates params vs query vs body by adding type suffixes. Missing the `Query` suffix in query schemas causes a runtime import error.

**How to apply:** Before importing any schema, check the actual export names:
```bash
grep "^export const" lib/api-zod/src/generated/api.ts | grep -i "Params\|Body"
```
Common gotcha: `ListMaterialsQueryParams` (correct) vs `ListMaterialsParams` (does not exist).
