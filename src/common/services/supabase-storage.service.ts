import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Multer } from 'multer';

@Injectable()
export class SupabaseStorageService {
  private supabaseClient: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.DB_HOST;
    const supabaseServiceKey = process.env.DB_PASSWORD;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables',
      );
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    path: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new InternalServerErrorException(
          `Supabase upload error: ${error.message}`,
        );
      }

      // obtener la URL pública del archivo subido
      const { data: urlData } = this.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to upload file to Supabase: ${error.message}`,
      );
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await this.supabaseClient.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new InternalServerErrorException(
          `Supabase delete error: ${error.message}`,
        );
      }
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to delete file from Supabase: ${error.message}`,
      );
    }
  }
}
