import Database from "@tauri-apps/plugin-sql";
import { isBoolean } from "es-toolkit";
import { Kysely } from "kysely";
import { TauriSqliteDialect } from "kysely-dialect-tauri";
import { SerializePlugin } from "kysely-plugin-serialize";
import type { DatabaseSchema } from "@/types/database";
import { getSaveDatabasePath } from "@/utils/path";

let db: Kysely<DatabaseSchema> | null = null;

export const getDatabase = async () => {
  if (db) return db;

  const path = await getSaveDatabasePath();

  db = new Kysely<DatabaseSchema>({
    dialect: new TauriSqliteDialect({
      database: (prefix) => Database.load(prefix + path),
    }),
    plugins: [
      new SerializePlugin({
        deserializer: (value) => value,
        serializer: (value) => {
          if (isBoolean(value)) {
            return Number(value);
          }

          return value;
        },
      }),
    ],
  });

  await db.schema
    .createTable("history")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("type", "text")
    .addColumn("group", "text")
    .addColumn("value", "text")
    .addColumn("search", "text")
    .addColumn("count", "integer")
    .addColumn("width", "integer")
    .addColumn("height", "integer")
    .addColumn("favorite", "integer", (col) => col.defaultTo(0))
    .addColumn("createTime", "text")
    .addColumn("note", "text")
    .addColumn("subtype", "text")
    .addColumn("sourceAppName", "text")
    .addColumn("sourceAppIcon", "text")
    .execute();

  // Try to add the columns if the table already existed and lacked them
  // Catching errors in case they already exist (SQLite will throw if adding duplicate columns)
  const columnsToAdd = ["subtype", "sourceAppName", "sourceAppIcon"];
  for (const col of columnsToAdd) {
    try {
      await db.schema.alterTable("history").addColumn(col, "text").execute();
    } catch (_error) {
      // Column might already exist, ignore error
    }
  }

  return db;
};

export const destroyDatabase = async () => {
  const db = await getDatabase();

  return db.destroy();
};
