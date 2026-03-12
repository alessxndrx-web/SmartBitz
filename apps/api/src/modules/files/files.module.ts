import { Module, forwardRef } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { RolesModule } from '../roles/roles.module';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [
    FilesService, 
    
    LocalStorageProvider,
    {
      provide: 'StorageProvider',
      useClass: LocalStorageProvider,
    },
  ],
  exports: [FilesService, 'StorageProvider'],
  imports: [
    forwardRef(() => RolesModule),
    ConfigModule,
  ],
})
export class FilesModule {}
