import { eq } from "drizzle-orm";
import { PgTable, TableConfig, PgColumn } from "drizzle-orm/pg-core";
import { BaseRepository } from "../base.repository";
import { Database } from "@/lib/infrastructure/db/drizzle";

// テスト用のモックデータ型
interface TestEntity {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// テスト用のモックテーブル
const mockTable = {
  name: "test_table",
  _: {},
  $inferSelect: {} as any,
  $inferInsert: {} as any,
  getSQL: () => ({ sql: "", params: [] }),
} as unknown as PgTable<TableConfig>;

// テスト用のモックカラム
const mockIdColumn = {
  name: "id",
} as unknown as PgColumn<any>;

// テスト用のリポジトリクラス
class TestRepository extends BaseRepository<TestEntity> {
  protected get idColumn(): PgColumn<any> {
    return mockIdColumn;
  }
}

describe("BaseRepository", () => {
  let repository: TestRepository;
  let mockDb: jest.Mocked<any>;

  beforeEach(() => {
    // データベースのモックを作成
    mockDb = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    // リポジトリのインスタンスを作成
    repository = new TestRepository(mockDb as unknown as Database, mockTable);
  });

  describe("findById", () => {
    it("should find entity by id", async () => {
      const mockEntity = {
        id: 1,
        name: "Test Entity",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select = jest.fn().mockReturnThis();
      mockDb.from = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.limit = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue([mockEntity]);

      const result = await repository.findById(1);

      expect(result).toEqual(mockEntity);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTable);
      expect(mockDb.where).toHaveBeenCalledWith(eq(mockIdColumn, 1));
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    }, 10000);

    it("should return null when entity is not found", async () => {
      mockDb.select = jest.fn().mockReturnThis();
      mockDb.from = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.limit = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue([]);

      const result = await repository.findById(1);

      expect(result).toBeNull();
    }, 10000);
  });

  describe("findAll", () => {
    it("should find all entities", async () => {
      const mockEntities = [
        {
          id: 1,
          name: "Test Entity 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Test Entity 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select = jest.fn().mockReturnThis();
      mockDb.from = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue(mockEntities);

      const result = await repository.findAll();

      expect(result).toEqual(mockEntities);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTable);
    }, 10000);
  });

  describe("create", () => {
    it("should create new entity", async () => {
      const mockInput = {
        name: "New Entity",
      };

      const mockEntity = {
        id: 1,
        ...mockInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert = jest.fn().mockReturnThis();
      mockDb.values = jest.fn().mockReturnThis();
      mockDb.returning = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue([mockEntity]);

      const result = await repository.create(mockInput);

      expect(result).toEqual(mockEntity);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(mockInput);
      expect(mockDb.returning).toHaveBeenCalled();
    }, 10000);
  });

  describe("update", () => {
    it("should update entity", async () => {
      const mockInput = {
        name: "Updated Entity",
      };

      const mockEntity = {
        id: 1,
        ...mockInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.update = jest.fn().mockReturnThis();
      mockDb.set = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.returning = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue([mockEntity]);

      const result = await repository.update(1, mockInput);

      expect(result).toEqual(mockEntity);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalledWith(eq(mockIdColumn, 1));
      expect(mockDb.returning).toHaveBeenCalled();
    }, 10000);

    it("should return null when entity is not found", async () => {
      mockDb.update = jest.fn().mockReturnThis();
      mockDb.set = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.returning = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue([]);

      const result = await repository.update(1, { name: "Updated Entity" });

      expect(result).toBeNull();
    }, 10000);
  });

  describe("delete", () => {
    it("should delete entity", async () => {
      mockDb.delete = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.returning = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue([{ id: 1 }]);

      const result = await repository.delete(1);

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalledWith(eq(mockIdColumn, 1));
      expect(mockDb.returning).toHaveBeenCalled();
    }, 10000);

    it("should return false when entity is not found", async () => {
      mockDb.delete = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.returning = jest.fn().mockReturnThis();
      mockDb.execute = jest.fn().mockResolvedValue([]);

      const result = await repository.delete(1);

      expect(result).toBe(false);
    }, 10000);
  });
});
