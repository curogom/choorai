import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [HealthModule, ProjectsModule],
})
export class AppModule {}
