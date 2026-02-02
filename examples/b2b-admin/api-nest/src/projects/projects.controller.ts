import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    let pageNum = page ? parseInt(page, 10) : 1;
    let pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(pageSizeNum) || pageSizeNum < 1) pageSizeNum = 1;
    if (pageSizeNum > 100) pageSizeNum = 100;

    return this.projectsService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.projectsService.remove(id);
  }
}
