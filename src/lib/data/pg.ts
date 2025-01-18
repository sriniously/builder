interface ProcessOptions {
  tableName: string;
  parentTableName?: string;
  parentTableId?: string;
  parentTableIdType?: PostgresType;
  tableId?: string;
  customTypes?: Record<string, PostgresType>;
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | Date
  | JsonObject
  | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonArray = JsonValue[];

enum PostgresType {
  // Numeric types
  SMALLINT = "SMALLINT",
  INTEGER = "INTEGER",
  BIGINT = "BIGINT",
  DECIMAL = "DECIMAL",
  NUMERIC = "NUMERIC",
  REAL = "REAL",
  DOUBLE_PRECISION = "DOUBLE PRECISION",
  SERIAL = "SERIAL",
  BIGSERIAL = "BIGSERIAL",

  // Character types
  VARCHAR = "VARCHAR",
  CHAR = "CHAR",
  TEXT = "TEXT",

  // Date/Time types
  TIMESTAMP = "TIMESTAMP WITH TIME ZONE",
  TIMESTAMPTZ = "TIMESTAMPTZ",
  DATE = "DATE",
  TIME = "TIME",
  TIMETZ = "TIMETZ",
  INTERVAL = "INTERVAL",

  // Boolean type
  BOOLEAN = "BOOLEAN",

  // JSON types
  JSON = "JSON",
  JSONB = "JSONB",
}

const typeMapping: Record<string, PostgresType> = {
  string: PostgresType.TEXT,
  number: PostgresType.NUMERIC,
  boolean: PostgresType.BOOLEAN,
  date: PostgresType.TIMESTAMPTZ,
  regexp: PostgresType.TEXT,
  undefined: PostgresType.TEXT,
  null: PostgresType.TEXT,
  object: PostgresType.JSONB,
  array: PostgresType.JSONB,
};

// templates
class PostgresStatementBuilder {
  static createTable(name: string): string {
    return `CREATE TABLE ${name} (`;
  }

  static column(
    name: string,
    type: string,
    constraints: string[] = []
  ): string {
    return `  ${name} ${type}${
      constraints.length ? " " + constraints.join(" ") : ""
    },`;
  }

  static primaryKey(columns: string[]): string {
    return `  PRIMARY KEY (${columns.join(", ")})`;
  }

  static foreignKey(
    columns: string[],
    referenceTable: string,
    referenceColumns: string[]
  ): string {
    return `  FOREIGN KEY (${columns.join(
      ", "
    )}) REFERENCES ${referenceTable}(${referenceColumns.join(", ")})`;
  }

  static close(): string {
    return ");";
  }
}

// Utility functions
class PostgresUtils {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isTimestamp(value: any): boolean {
    if (value instanceof Date) return true;
    if (typeof value !== "string") return false;

    // Check for ISO 8601 timestamp format
    const timestampRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:?\d{2})?$/;
    return timestampRegex.test(value);
  }

  static normalizeIdentifier(name: string): string {
    // Convert to snake_case and ensure PostgreSQL identifier compliance
    return name
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_+/g, "_");
  }

  static getColumnType(
    value: JsonValue,
    customTypes?: Record<string, PostgresType>
  ): PostgresType {
    if (value === null) return PostgresType.TEXT;
    if (value instanceof Date) return PostgresType.TIMESTAMPTZ;

    const type = typeof value;

    if (type === "number") {
      if (Number.isInteger(value)) {
        return Number(value) > 2147483647
          ? PostgresType.BIGINT
          : PostgresType.INTEGER;
      }
      return PostgresType.NUMERIC;
    }

    if (Array.isArray(value)) return PostgresType.JSONB;
    if (type === "object") return PostgresType.JSONB;

    return customTypes?.[type] || typeMapping[type] || PostgresType.TEXT;
  }
}

// Main processing function
function processObject(obj: JsonObject, options: ProcessOptions): string[] {
  const {
    tableName,
    parentTableName,
    parentTableId,
    parentTableIdType,
    tableId,
  } = options;

  const normalizedTableName = PostgresUtils.normalizeIdentifier(tableName);
  const output: string[] = [];
  const tables: string[] = [];

  // Start creating table
  output.push(PostgresStatementBuilder.createTable(normalizedTableName));

  // Handle parent table reference
  if (parentTableName && parentTableId) {
    const parentIdColumnName = PostgresUtils.normalizeIdentifier(
      `${parentTableName}_${parentTableId}`
    );
    output.push(
      PostgresStatementBuilder.column(
        parentIdColumnName,
        parentTableIdType || PostgresType.INTEGER,
        ["NOT NULL"]
      )
    );
  }

  // Determine ID column
  let idColumn = "id";
  let idType = PostgresType.INTEGER;

  if (tableId && tableId in obj) {
    idColumn = PostgresUtils.normalizeIdentifier(tableId);
    idType = PostgresUtils.getColumnType(obj[tableId]);
  } else {
    const keys = Object.keys(obj);
    const idKey = keys.find(
      (key) => key.toLowerCase() === "id" || key.toLowerCase().endsWith("_id")
    );

    if (idKey) {
      idColumn = PostgresUtils.normalizeIdentifier(idKey);
      idType = PostgresUtils.getColumnType(obj[idKey]);
    } else {
      output.push(
        PostgresStatementBuilder.column(idColumn, PostgresType.SERIAL)
      );
    }
  }

  // Process remaining columns
  for (const [key, value] of Object.entries(obj)) {
    if (key === tableId) continue;

    const normalizedKey = PostgresUtils.normalizeIdentifier(key);
    const type = PostgresUtils.getColumnType(value);

    if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Date)
    ) {
      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object") {
          tables.push("\n");
          tables.push(
            processObject(value[0] as JsonObject, {
              tableName: `${normalizedTableName}_${normalizedKey}`,
              parentTableName: normalizedTableName,
              parentTableId: idColumn,
              parentTableIdType: idType,
            }).join("\n")
          );
        } else {
          output.push(PostgresStatementBuilder.column(normalizedKey, type));
        }
      } else {
        tables.push("\n");
        tables.push(
          processObject(value as JsonObject, {
            tableName: `${normalizedTableName}_${normalizedKey}`,
            parentTableName: normalizedTableName,
            parentTableId: idColumn,
            parentTableIdType: idType,
          }).join("\n")
        );
      }
      continue;
    }

    output.push(PostgresStatementBuilder.column(normalizedKey, type));
  }

  // Add primary key
  output.push(PostgresStatementBuilder.primaryKey([idColumn]));

  // Add foreign key if this is a child table
  if (parentTableName && parentTableId) {
    output.push(",");
    output.push(
      PostgresStatementBuilder.foreignKey(
        [`${parentTableName}_${parentTableId}`],
        parentTableName,
        [parentTableId]
      )
    );
  }

  output.push(PostgresStatementBuilder.close());

  return [...output, ...tables];
}

export function generatePostgresSchema(
  input: string | JsonObject,
  options: Partial<ProcessOptions> = {}
): string {
  const defaultOptions: ProcessOptions = {
    tableName: "generic",
    ...options,
  };

  let obj: JsonObject;
  if (typeof input === "string") {
    try {
      obj = JSON.parse(input);
    } catch {
      throw new Error("Invalid JSON string provided");
    }
  } else {
    obj = input;
  }

  return processObject(obj, defaultOptions).join("\n");
}

// ------------------------------------------------------------------------------------------------ INSERT ------------------------------------------------------------------------------------------------

interface InsertOptions {
  tableName?: string;
  returning?: boolean | string[];
  onConflict?: string[];
  onConflictAction?: "update" | "nothing";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeConverters?: Record<string, (value: any) => string>;
  parentTableName?: string;
  parentTableId?: string;
  parentIdValue?: string | number;
}

class PostgresValueFormatter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static format(value: any): string {
    if (value === null || value === undefined) {
      return "NULL";
    }

    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }

    if (typeof value === "number") {
      return value.toString();
    }

    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }

    if (Array.isArray(value) || typeof value === "object") {
      return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }

    return `'${String(value).replace(/'/g, "''")}'`;
  }
}

function processInserts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[],
  options: InsertOptions
): string[] {
  const {
    tableName = "generic",
    parentTableName,
    parentTableId,
    parentIdValue,
  } = options;

  const normalizedTableName = PostgresUtils.normalizeIdentifier(tableName);
  const statements: string[] = [];

  // Separate nested objects/arrays and flat values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatData: Record<string, any> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nestedData: Record<string, any[]> = {};

  // Process first row to identify structure
  const sampleRow = data[0];
  for (const [key, value] of Object.entries(sampleRow)) {
    const isNested =
      typeof value === "object" && value !== null && !(value instanceof Date);

    if (isNested) {
      nestedData[key] = [];
    } else {
      flatData[key] = value;
    }
  }

  // Prepare main table data
  const mainTableData = data.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatRow: Record<string, any> = {};

    // Add parent reference if this is a child table
    if (parentTableName && parentTableId && parentIdValue !== undefined) {
      flatRow[`${parentTableName}_${parentTableId}`] = parentIdValue;
    }

    // Add non-nested fields
    for (const [key, value] of Object.entries(row)) {
      if (!(key in nestedData)) {
        flatRow[key] = value;
      }
    }

    return flatRow;
  });

  // Generate insert for main table
  statements.push(
    generateFlatInsertStatement(mainTableData, {
      ...options,
      tableName: normalizedTableName,
    })
  );

  // Process nested objects
  for (const row of data) {
    for (const [key, value] of Object.entries(row)) {
      if (key in nestedData) {
        const normalizedKey = PostgresUtils.normalizeIdentifier(key);
        const nestedTableName = `${normalizedTableName}_${normalizedKey}`;

        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object") {
            statements.push(
              processInserts(value, {
                ...options,
                tableName: nestedTableName,
                parentTableName: normalizedTableName,
                parentTableId: "id",
                parentIdValue: row.id,
              }).join("\n")
            );
          }
        } else if (typeof value === "object" && value !== null) {
          statements.push(
            processInserts([value], {
              ...options,
              tableName: nestedTableName,
              parentTableName: normalizedTableName,
              parentTableId: "id",
              parentIdValue: row.id,
            }).join("\n")
          );
        }
      }
    }
  }

  return statements;
}

function generateFlatInsertStatement(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[],
  options: InsertOptions
): string {
  if (!data.length) {
    throw new Error("No data provided for insert statement generation");
  }

  const {
    tableName = "generic",
    returning = true,
    onConflict,
    onConflictAction = "nothing",
    typeConverters = {},
  } = options;

  const columns = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  ).sort();

  let sql = `INSERT INTO ${tableName} (${columns.join(", ")})\nVALUES\n`;

  const values = data.map((row) => {
    const rowValues = columns.map((col) => {
      const value = row[col];
      return typeConverters[col]
        ? typeConverters[col](value)
        : PostgresValueFormatter.format(value);
    });
    return `(${rowValues.join(", ")})`;
  });

  sql += values.join(",\n");

  if (onConflict?.length) {
    sql += `\nON CONFLICT (${onConflict.join(", ")})`;
    if (onConflictAction === "update") {
      const updateColumns = columns.filter((col) => !onConflict.includes(col));
      if (updateColumns.length) {
        sql += `\nDO UPDATE SET\n`;
        sql += updateColumns
          .map((col) => `  ${col} = EXCLUDED.${col}`)
          .join(",\n");
      } else {
        sql += "\nDO NOTHING";
      }
    } else {
      sql += "\nDO NOTHING";
    }
  }

  if (returning) {
    if (Array.isArray(returning)) {
      sql += `\nRETURNING ${returning.join(", ")}`;
    } else {
      sql += "\nRETURNING *";
    }
  }

  return sql + ";";
}

function generateInsertStatements(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[],
  options: InsertOptions
): string {
  return processInserts(data, options).join("\n\n");
}

export { generateInsertStatements, type InsertOptions };
