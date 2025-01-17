import Dexie, { type EntityTable } from "dexie";
import { Project, Resource } from "./models";

const db = new Dexie("BuilderDB") as Dexie & {
  projects: EntityTable<Project, "id">;
  resources: EntityTable<Resource, "id">;
};

db.version(1).stores({
  projects: "++id",
  resources: "++id, projectId",
});

export { db };
