export declare const organizationesTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "organizationes";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "organizationes";
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
            generated: undefined;
        }, {}, {}>;
        handle: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "organizationes";
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
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "organizationes";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const organizationRelation: import("drizzle-orm").Relations<"organizationes", {
    applications: import("drizzle-orm").Many<"applications">;
    users: import("drizzle-orm").Many<"users">;
}>;
//# sourceMappingURL=organization.d.ts.map