import { v4 as uuidv4 } from 'uuid';
import type { Project, ProjectCreate, ProjectUpdate } from '../types/index.js';

class ProjectStorage {
  private projects: Map<string, Project> = new Map();

  create(data: ProjectCreate): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: uuidv4(),
      name: data.name,
      description: data.description ?? null,
      created_at: now,
      updated_at: now,
    };
    this.projects.set(project.id, project);
    return project;
  }

  get(id: string): Project | null {
    return this.projects.get(id) ?? null;
  }

  list(page: number, pageSize: number): { items: Project[]; total: number } {
    const all = Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return { items, total: all.length };
  }

  update(id: string, data: ProjectUpdate): Project | null {
    const project = this.projects.get(id);
    if (!project) return null;

    const updated: Project = {
      ...project,
      name: data.name ?? project.name,
      description: data.description !== undefined ? data.description : project.description,
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.projects.delete(id);
  }

  clear(): void {
    this.projects.clear();
  }
}

export const projectStorage = new ProjectStorage();
