export declare const assetsTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "assets";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "assets";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: import("drizzle-orm").GeneratedColumnConfig<string>;
        }, {}, {}>;
        manifestId: import("drizzle-orm/pg-core").PgColumn<{
            name: "manifest_id";
            tableName: "assets";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: import("drizzle-orm").GeneratedColumnConfig<string>;
        }, {}, {}>;
        path: import("drizzle-orm/pg-core").PgColumn<{
            name: "path";
            tableName: "assets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: import("drizzle-orm").GeneratedColumnConfig<string>;
        }, {}, {}>;
        contentType: import("drizzle-orm/pg-core").PgColumn<{
            name: "content_type";
            tableName: "assets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: import("drizzle-orm").GeneratedColumnConfig<string>;
        }, {}, {}>;
        hash: import("drizzle-orm/pg-core").PgColumn<{
            name: "hash";
            tableName: "assets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: import("drizzle-orm").GeneratedColumnConfig<string>;
        }, {}, {}>;
        fileExtension: import("drizzle-orm/pg-core").PgColumn<{
            name: "file_extension";
            tableName: "assets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: import("drizzle-orm").GeneratedColumnConfig<string>;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const assetsRelation: import("drizzle-orm").Relations<"assets", {
    manifest: import("drizzle-orm").One<"manifests", true>;
}>;
//# sourceMappingURL=assets.d.ts.map