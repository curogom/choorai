import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  private projects: Map<string, Project> = new Map();

  create(createProjectDto: CreateProjectDto): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: uuidv4(),
      name: createProjectDto.name,
      description: createProjectDto.description ?? null,
      created_at: now,
      updated_at: now,
    };
    this.projects.set(project.id, project);
    return project;
  }

  findAll(
    page: number,
    pageSize: number,
  ): { items: Project[]; total: number; page: number; page_size: number } {
    const all = Array.from(this.projects.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return { items, total: all.length, page, page_size: pageSize };
  }

  findOne(id: string): Project {
    const project = this.projects.get(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  update(id: string, updateProjectDto: UpdateProjectDto): Project {
    const project = this.projects.get(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated: Project = {
      ...project,
      name: updateProjectDto.name ?? project.name,
      description:
        updateProjectDto.description !== undefined
          ? updateProjectDto.description
          : project.description,
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    const exists = this.projects.has(id);
    if (!exists) {
      throw new NotFoundException('Project not found');
    }
    this.projects.delete(id);
  }

  // For testing
  clear(): void {
    this.projects.clear();
  }
}
