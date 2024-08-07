export interface Bundle {
    ios: string;
    android: string;
}
export declare const applicationsTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "applications";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "applications";
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
        organizationId: import("drizzle-orm/pg-core").PgColumn<{
            name: "organization_id";
            tableName: "applications";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "applications";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "applications";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: import("drizzle-orm").GeneratedColumnConfig<Date>;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const applicationsRelation: import("drizzle-orm").Relations<"applications", {
    organization: import("drizzle-orm").One<"teams", true>;
    manifests: import("drizzle-orm").Many<"manifests">;
}>;
//# sourceMappingURL=applications.d.ts.map