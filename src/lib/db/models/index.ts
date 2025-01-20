export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface Resource {
  id: number;
  name: string;
  description: string;
  projectId: number;
  // stringified zod schema
  content: string;
}

export interface Tag {
  id: number;
  name: string;
  description: string;
  projectId: number;
  resourceId?: number;
}

export interface Endpoint {
  id: number;
  name: string;
  description: string;
  projectId: number;
  resourceId: number;
  tagId: number;
  method: string;
  url: string;
  headers: string;
  body: string;
  response: string;
  queryParams: string;
  pathParams: string;
}
