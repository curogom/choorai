import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TodosService } from '../src/todos/todos.service';

describe('B2C Todo API (e2e)', () => {
  let app: INestApplication;
  let todosService: TodosService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    todosService = moduleFixture.get<TodosService>(TodosService);
  });

  beforeEach(() => {
    todosService.clear();
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

  describe('Todos', () => {
    describe('POST /api/v1/todos', () => {
      it('creates todo with all fields', () => {
        return request(app.getHttpServer())
          .post('/api/v1/todos')
          .send({ title: 'Test Todo', description: 'A test' })
          .expect(201)
          .expect((res) => {
            expect(res.body.title).toBe('Test Todo');
            expect(res.body.description).toBe('A test');
            expect(res.body.is_completed).toBe(false);
            expect(res.body.id).toBeDefined();
            expect(res.body.created_at).toBeDefined();
          });
      });

      it('creates todo without description', () => {
        return request(app.getHttpServer())
          .post('/api/v1/todos')
          .send({ title: 'Minimal' })
          .expect(201)
          .expect((res) => {
            expect(res.body.title).toBe('Minimal');
            expect(res.body.description).toBeNull();
            expect(res.body.is_completed).toBe(false);
          });
      });

      it('rejects empty title', () => {
        return request(app.getHttpServer())
          .post('/api/v1/todos')
          .send({ title: '' })
          .expect(400);
      });
    });

    describe('GET /api/v1/todos', () => {
      it('returns empty list', () => {
        return request(app.getHttpServer())
          .get('/api/v1/todos')
          .expect(200)
          .expect((res) => {
            expect(res.body.items).toEqual([]);
            expect(res.body.total).toBe(0);
            expect(res.body.page).toBe(1);
            expect(res.body.page_size).toBe(10);
          });
      });

      it('returns paginated results', async () => {
        // Create 3 todos
        for (let i = 1; i <= 3; i++) {
          await request(app.getHttpServer())
            .post('/api/v1/todos')
            .send({ title: `Todo ${i}` });
        }

        return request(app.getHttpServer())
          .get('/api/v1/todos?page=1&page_size=2')
          .expect(200)
          .expect((res) => {
            expect(res.body.items.length).toBe(2);
            expect(res.body.total).toBe(3);
          });
      });
    });

    describe('GET /api/v1/todos/:id', () => {
      it('returns todo by id', async () => {
        const createRes = await request(app.getHttpServer())
          .post('/api/v1/todos')
          .send({ title: 'Find Me' });

        return request(app.getHttpServer())
          .get(`/api/v1/todos/${createRes.body.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.title).toBe('Find Me');
          });
      });

      it('returns 404 for non-existent', () => {
        return request(app.getHttpServer())
          .get('/api/v1/todos/non-existent')
          .expect(404);
      });
    });

    describe('PATCH /api/v1/todos/:id', () => {
      it('updates todo title', async () => {
        const createRes = await request(app.getHttpServer())
          .post('/api/v1/todos')
          .send({ title: 'Original' });

        return request(app.getHttpServer())
          .patch(`/api/v1/todos/${createRes.body.id}`)
          .send({ title: 'Updated' })
          .expect(200)
          .expect((res) => {
            expect(res.body.title).toBe('Updated');
          });
      });

      it('marks todo as completed', async () => {
        const createRes = await request(app.getHttpServer())
          .post('/api/v1/todos')
          .send({ title: 'Complete Me' });

        expect(createRes.body.is_completed).toBe(false);

        return request(app.getHttpServer())
          .patch(`/api/v1/todos/${createRes.body.id}`)
          .send({ is_completed: true })
          .expect(200)
          .expect((res) => {
            expect(res.body.is_completed).toBe(true);
          });
      });

      it('returns 404 for non-existent', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/todos/non-existent')
          .send({ title: 'Updated' })
          .expect(404);
      });
    });

    describe('DELETE /api/v1/todos/:id', () => {
      it('deletes todo', async () => {
        const createRes = await request(app.getHttpServer())
          .post('/api/v1/todos')
          .send({ title: 'Delete Me' });

        await request(app.getHttpServer())
          .delete(`/api/v1/todos/${createRes.body.id}`)
          .expect(204);

        return request(app.getHttpServer())
          .get(`/api/v1/todos/${createRes.body.id}`)
          .expect(404);
      });

      it('returns 404 for non-existent', () => {
        return request(app.getHttpServer())
          .delete('/api/v1/todos/non-existent')
          .expect(404);
      });
    });
  });
});
