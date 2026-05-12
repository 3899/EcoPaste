import { exists, remove } from "@tauri-apps/plugin-fs";
import type { AnyObject } from "antd/es/_util/type";
import { type SelectQueryBuilder, sql } from "kysely";
import type { DatabaseSchema, DatabaseSchemaHistory } from "@/types/database";
import { getSaveImagePath, join } from "@/utils/path";
import { getDatabase, historyColumns, maintainDatabaseAfterDelete } from ".";

type QueryBuilder = SelectQueryBuilder<DatabaseSchema, "history", AnyObject>;
export type HistoryDeleteTarget = Pick<
  DatabaseSchemaHistory,
  "id" | "type" | "value"
> &
  Partial<Pick<DatabaseSchemaHistory, "createTime">>;

export const selectHistory = async (
  fn?: (qb: QueryBuilder) => QueryBuilder,
) => {
  const db = await getDatabase();

  let qb = db
    .selectFrom("history")
    .select(historyColumns as (keyof DatabaseSchemaHistory)[]) as QueryBuilder;

  if (fn) {
    qb = fn(qb);
  }

  return qb.execute() as Promise<DatabaseSchemaHistory[]>;
};

export const selectHistoryDeleteTargets = async (
  fn?: (qb: QueryBuilder) => QueryBuilder,
) => {
  const db = await getDatabase();

  let qb = db
    .selectFrom("history")
    .select([
      "id",
      "type",
      "createTime",
      sql<string>`CASE WHEN type = 'image' THEN value ELSE '' END`.as("value"),
    ]) as QueryBuilder;

  if (fn) {
    qb = fn(qb);
  }

  return qb.execute() as Promise<HistoryDeleteTarget[]>;
};

export const insertHistory = async (data: DatabaseSchemaHistory) => {
  const db = await getDatabase();

  return db.insertInto("history").values(data).execute();
};

export const updateHistory = async (
  id: string,
  nextData: Partial<DatabaseSchemaHistory>,
) => {
  const db = await getDatabase();

  return db.updateTable("history").set(nextData).where("id", "=", id).execute();
};

export const deleteHistory = async (
  data: HistoryDeleteTarget,
  deleteLocalFile = true,
) => {
  const { id, type, value } = data;

  const db = await getDatabase();

  await db.deleteFrom("history").where("id", "=", id).execute();

  if (!deleteLocalFile || type !== "image") return;

  let path = value;

  // Handle case where image value is an array or string
  if (Array.isArray(value)) {
    path = value[0];
  }

  if (typeof path !== "string") return;

  const saveImagePath = getSaveImagePath();

  if (!path.startsWith(saveImagePath)) {
    const isAbs = /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith("/");
    if (!isAbs) {
      path = join(saveImagePath, path);
    }
  }

  const existed = await exists(path);

  if (!existed) return;

  return remove(path);
};

export const deleteHistories = async (
  list: HistoryDeleteTarget[],
  options?: {
    deleteLocalFile?: boolean;
    vacuum?: boolean;
  },
) => {
  const deleteLocalFile = options?.deleteLocalFile ?? true;
  const shouldVacuum = options?.vacuum ?? list.length >= 50;
  let deleted = 0;

  try {
    for (const item of list) {
      await deleteHistory(item, deleteLocalFile);
      deleted += 1;
    }
  } finally {
    if (deleted > 0) {
      await maintainDatabaseAfterDelete({ vacuum: shouldVacuum });
    }
  }

  return deleted;
};
