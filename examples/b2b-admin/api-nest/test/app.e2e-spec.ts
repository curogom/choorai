import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ProjectsService } from '../src/projects/projects.service';

describe('B2B Admin API (e2e)', () => {
  let app: INestApplication;
  let projectsService: ProjectsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    projectsService = moduleFixture.get<ProjectsService>(ProjectsService);
  });

  beforeEach(() => {
    projectsService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /health returns ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.version).toBe('0.1.0');
          expect(res.body.timestamp).toBeDefined();
        });
    });
  });

  describe('Projects', () => {
    describe('POST /api/v1/projects', () => {
      it('creates project with all fields', () => {
        return request(app.getHttpServer())
          .post('/api/v1/projects')
          .send({ name: 'Test Project', description: 'A test' })
          .expect(201)
          .expect((res) => {
            expect(res.body.name).toBe('Test Project');
            expect(res.body.description).toBe('A test');
            expect(res.body.id).toBeDefined();
            expect(res.body.created_at).toBeDefined();
          });
      });

      it('creates project without description', () => {
        return request(app.getHttpServer())
          .post('/api/v1/projects')
          .send({ name: 'Minimal' })
          .expect(201)
          .expect((res) => {
            expect(res.body.name).toBe('Minimal');
            expect(res.body.description).toBeNull();
          });
      });

      it('rejects empty name', () => {
        return request(app.getHttpServer())
          .post('/api/v1/projects')
          .send({ name: '' })
          .expect(400);
      });
    });

    describe('GET /api/v1/projects', () => {
      it('returns empty list', () => {
        return request(app.getHttpServer())
          .get('/api/v1/projects')
          .expect(200)
          .expect((res) => {
            expect(res.body.items).toEqual([]);
            expect(res.body.total).toBe(0);
            expect(res.body.page).toBe(1);
            expect(res.body.page_size).toBe(10);
          });
      });

      it('returns paginated results', async () => {
        // Create 3 projects
        for (let i = 1; i <= 3; i++) {
          await request(app.getHttpServer())
            .post('/api/v1/projects')
            .send({ name: `Project ${i}` });
        }

        return request(app.getHttpServer())
          .get('/api/v1/projects?page=1&page_size=2')
          .expect(200)
          .expect((res) => {
            expect(res.body.items.length).toBe(2);
            expect(res.body.total).toBe(3);
          });
      });
    });

    describe('GET /api/v1/projects/:id', () => {
      it('returns project by id', async () => {
        const createRes = await request(app.getHttpServer())
          .post('/api/v1/projects')
          .send({ name: 'Find Me' });

        return request(app.getHttpServer())
          .get(`/api/v1/projects/${createRes.body.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.name).toBe('Find Me');
          });
      });

      it('returns 404 for non-existent', () => {
        return request(app.getHttpServer())
          .get('/api/v1/projects/non-existent')
          .expect(404);
      });
    });

    describe('PUT /api/v1/projects/:id', () => {
      it('updates project', async () => {
        const createRes = await request(app.getHttpServer())
          .post('/api/v1/projects')
          .send({ name: 'Original' });

        return request(app.getHttpServer())
          .put(`/api/v1/projects/${createRes.body.id}`)
          .send({ name: 'Updated' })
          .expect(200)
          .expect((res) => {
            expect(res.body.name).toBe('Updated');
          });
      });

      it('returns 404 for non-existent', () => {
        return request(app.getHttpServer())
          .put('/api/v1/projects/non-existent')
          .send({ name: 'Updated' })
          .expect(404);
      });
    });

    describe('DELETE /api/v1/projects/:id', () => {
      it('deletes project', async () => {
        const createRes = await request(app.getHttpServer())
          .post('/api/v1/projects')
          .send({ name: 'Delete Me' });

        await request(app.getHttpServer())
          .delete(`/api/v1/projects/${createRes.body.id}`)
          .expect(204);

        return request(app.getHttpServer())
          .get(`/api/v1/projects/${createRes.body.id}`)
          .expect(404);
      });

      it('returns 404 for non-existent', () => {
        return request(app.getHttpServer())
          .delete('/api/v1/projects/non-existent')
          .expect(404);
      });
    });
  });
});
