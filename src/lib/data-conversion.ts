import { generate } from "ts-to-zod";
import { generateMock } from "@anatine/zod-mock";
import { z } from "zod";

export const tsToZod = (ts: string) => {
  const res = generate({
    sourceText: ts,
  });
  const schema = new Function("z", `return (${res.getZodSchemasFile("")});`)(z);
  return schema as z.ZodType;
};

export const generateMocks = (schema: z.ZodType, numberOfMocks = 1) => {
  return generateMock(schema, {
    recordKeysLength: numberOfMocks,
  });
};
