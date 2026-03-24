import { Uploader } from '@/domain/forum/application/storage/uploader'
import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { SupabaseStorage } from './supabase-storage'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Uploader,
      useClass: SupabaseStorage,
    },
  ],
  exports: [Uploader],
})
export class StorageModule {}
