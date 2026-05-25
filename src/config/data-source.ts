import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { configService } from './config.service';
config();



const AppDataSource = new DataSource({
 ...configService.createTypeOrmOptions(),
  synchronize: false,
  entities: ['**/*.entity.ts'],
  migrations: ['src/database/migrations/*-migration.ts'],
  migrationsRun: false,
  logging: true,
} as DataSourceOptions);

export default AppDataSource;