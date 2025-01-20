import Dexie, { type EntityTable } from "dexie";
import { Endpoint, Project, Resource, Tag } from "./models";

const db = new Dexie("BuilderDB") as Dexie & {
  projects: EntityTable<Project, "id">;
  resources: EntityTable<Resource, "id">;
  tags: EntityTable<Tag, "id">;
  endpoints: EntityTable<Endpoint, "id">;
};

db.version(1).stores({
  projects: "++id",
  resources: "++id, projectId",
  tags: "++id, projectId, resourceId",
  endpoints: "++id, projectId, resourceId, tagId",
});

export { db };
