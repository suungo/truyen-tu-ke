import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as streamifier from 'streamifier';
import { ConfigService } from '@nestjs/config';

// Kiểu dữ liệu trả về sau khi upload ảnh
export interface CloudinaryUploadResult {
  url: string; // URL công khai (http)
  secureUrl: string; // URL bảo mật (https) — dùng để lưu DB
  publicId: string; // ID để xóa ảnh sau này
  width: number;
  height: number;
  format: string; // jpg, png, webp...
  bytes: number; // Dung lượng file (bytes)
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  // Tải hình ảnh lên Cloudinary, trả về thông tin ảnh đã upload
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ixe_uploads',
          resource_type: 'image',
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            return reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${error.message}`,
              ),
            );
          }

          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Xóa hình ảnh khỏi Cloudinary theo publicId
  async deleteImage(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(
            new InternalServerErrorException(
              `Cloudinary delete failed: ${error.message}`,
            ),
          );
        } else {
          resolve({ result: result.result }); // 'ok' nếu xóa thành công
        }
      });
    });
  }
}
