import Dexie, { type EntityTable } from "dexie";
import { Project } from "./models/projects";

const db = new Dexie("BuilderDB") as Dexie & {
  projects: EntityTable<Project, "id">;
};

db.version(1).stores({
  projects: "++id",
});

export { db };
