import { Uploader, UploadParams } from '@/domain/forum/application/storage/uploader'
import { Injectable } from '@nestjs/common'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { EnvService } from '../env/env.service'

@Injectable()
export class SupabaseStorage implements Uploader {
  private client: SupabaseClient

  constructor(private envService: EnvService) {
    this.client = createClient(
      this.envService.get('SUPABASE_URL'),
      this.envService.get('SUPABASE_KEY'),
    )
  }

  async upload({ fileName, fileType, body }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID();
    const uniqueFileName = `${uploadId}-${fileName}`;
    const bucket = this.envService.get('SUPABASE_BUCKET');

    const { error } = await this.client.storage.from(bucket).upload(uniqueFileName, body, {
      contentType: fileType,
      upsert: false,
    });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return {
      url: uniqueFileName
    }
  }
}