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
