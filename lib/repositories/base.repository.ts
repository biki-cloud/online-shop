import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { PgTable, TableConfig, PgColumn } from "drizzle-orm/pg-core";

export interface IBaseRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected readonly table: PgTable<TableConfig>) {}

  protected abstract get idColumn(): PgColumn<any>;

  async findById(id: number): Promise<T | null> {
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1);
    return (result as T) || null;
  }

  async findAll(): Promise<T[]> {
    const result = await db.select().from(this.table);
    return result as T[];
  }

  async create(data: Partial<T>): Promise<T> {
    const [result] = await db
      .insert(this.table)
      .values(data as any)
      .returning();
    return result as T;
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    const [result] = await db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(this.idColumn, id))
      .returning();
    return (result as T) || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(this.table)
      .where(eq(this.idColumn, id))
      .returning();
    return result.length > 0;
  }
}
