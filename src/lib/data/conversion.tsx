import { generate } from "ts-to-zod";
import { zodToTs as zodToTsSystem, printNode } from "zod-to-ts";
import { generateMock } from "@anatine/zod-mock";
import { z } from "zod";
import { TFrom, TTo } from "./options";
import { match } from "ts-pattern";
import { jsonToGo } from "./json-to-go";
import {
  generateInsertStatements,
  generatePostgresSchema,
} from "./pg";

export const tsToZod = (ts: string, onlyString: boolean) => {
  if (!ts.startsWith("type") && !ts.startsWith("interface")) {
    ts = `type random = ${ts}`;
  }

  const res = generate({
    sourceText: ts,
  });
  const stringifiedSchema = res.getZodSchemasFile("");

  return zodStringToZod(stringifiedSchema, onlyString);
};

export const zodToTs = (zodString: string) => {
  if (!zodString.startsWith("const") && !zodString.startsWith("let")) {
    zodString = `const zodSchema = ${zodString};`;
  }
  const zodSchema = zodStringToZod(zodString, false) as z.ZodType;
  const { node } = zodToTsSystem(zodSchema);
  return printNode(node);
};

export const zodStringToZod = (zodString: string, onlyString: boolean) => {
  const zodSchemaWithoutDeclaration = zodString.slice(zodString.indexOf("z."));
  const zodSchemaWithoutSemicolon = zodSchemaWithoutDeclaration.slice(
    0,
    zodSchemaWithoutDeclaration.indexOf(";")
  );
  const schema = new Function("z", `return (${zodSchemaWithoutSemicolon});`)(z);
  return onlyString ? zodSchemaWithoutSemicolon : (schema as z.ZodType);
};

export const generateMocks = (schema: z.ZodType, numberOfMocks = 1) => {
  if (numberOfMocks === 1) {
    const mock = JSON.stringify(generateMock(schema), null, 2);
    return mock;
  }

  const mocks = [];
  for (let i = 0; i < numberOfMocks; i++) {
    mocks.push(generateMock(schema));
  }

  return JSON.stringify(mocks, null, 2);
};

export const handleConvert = ({
  from,
  to,
  fromData,
  numOfMocks = "1",
  setToData,
}: {
  from: TFrom | TTo;
  to: TFrom | TTo;
  fromData: string;
  numOfMocks?: string;
  setToData: (data: string) => void;
}) => {
  try {
    let finalData = "";

    match({ from, to })
      .with({ from: "ts" }, () => {
        match(to)
          .with("json", () => {
            const zodSchema = tsToZod(fromData, false) as z.ZodType;
            const json = generateMocks(zodSchema, Number(numOfMocks));
            finalData = json;
          })
          .with("zod", () => {
            const zodSchema = tsToZod(fromData, true);
            finalData = `${zodSchema}`;
          })
          .with("go", () => {
            const zodSchema = tsToZod(fromData, false) as z.ZodType;
            const json = generateMocks(zodSchema, 1);
            const { go } = jsonToGo(json);
            finalData = go;
          })
          .with("pg", () => {
            const zodSchema = tsToZod(fromData, false) as z.ZodType;
            const createJson = generateMocks(zodSchema, 1);
            let insertJsons = generateMocks(zodSchema, Number(numOfMocks));
            if (numOfMocks === "1") {
              insertJsons = `[${insertJsons}]`;
            }
            finalData = `${generatePostgresSchema(
              createJson
            )}\n\n${generateInsertStatements(
              JSON.parse(insertJsons),
              {}
            )}`;
          })
          .otherwise(() => {});
      })
      .with({ from: "zod" }, () => {
        match(to)
          .with("json", () => {
            let payload = "";
            if (!fromData.startsWith("const") && !fromData.startsWith("let")) {
              payload = `const zodSchema = ${fromData};`;
            }
            const zodSchema = zodStringToZod(payload, false) as z.ZodType;
            const json = generateMocks(zodSchema, Number(numOfMocks));
            finalData = json;
          })
          .with("ts", () => {
            const ts = zodToTs(fromData);
            finalData = ts;
          })
          .with("go", () => {
            let payload = "";
            if (!fromData.startsWith("const") && !fromData.startsWith("let")) {
              payload = `const zodSchema = ${fromData};`;
            }
            const zodSchema = zodStringToZod(payload, false) as z.ZodType;
            const json = generateMocks(zodSchema, Number(numOfMocks));
            const { go } = jsonToGo(json);
            finalData = go;
          })
          .with("pg", () => {
            let payload = "";
            if (!fromData.startsWith("const") && !fromData.startsWith("let")) {
              payload = `const zodSchema = ${fromData};`;
            }
            const zodSchema = zodStringToZod(payload, false) as z.ZodType;
            const createJson = generateMocks(zodSchema, Number(numOfMocks));
            let insertJsons = generateMocks(zodSchema, Number(numOfMocks));
            if (numOfMocks === "1") {
              insertJsons = `[${insertJsons}]`;
            }
            finalData = `${generatePostgresSchema(
              createJson
            )}\n\n${generateInsertStatements(
              JSON.parse(insertJsons),
              {}
            )}`;
          })
          .otherwise(() => {});
      })
      .otherwise(() => {});

    setToData(finalData);
  } catch (e) {
    console.log(e);
  }
};
