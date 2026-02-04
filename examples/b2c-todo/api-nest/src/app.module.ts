import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [HealthModule, TodosModule],
})
export class AppModule {}
