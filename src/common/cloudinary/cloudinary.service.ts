import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
	private readonly logger = new Logger(CloudinaryService.name);

	async uploadImage(
		file: Express.Multer.File,
		folderPath: string,
	): Promise<{ url: string; public_id: string }> {
		return new Promise((resolve, reject) => {
			const sanitizedName = file.originalname
				.split('.')[0]
				.replace(/[^\w\-]+/g, '');
			const publicId = `${sanitizedName}${Date.now()}`;
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: folderPath,
					public_id: publicId,
					resource_type: 'image',
				},
				(error, result) => {
					if (error) return reject(error);
					resolve({
						url: result!.secure_url,
						public_id: result!.public_id,
					});
				},
			);
			const readableStream = new Readable();
			readableStream.push(file.buffer);
			readableStream.push(null);
			readableStream.pipe(uploadStream);
		});
	}

	async uploadImages(
		files: Express.Multer.File[],
		folderPath: string,
	): Promise<{ url: string; public_id: string }[]> {
		if (!files || files.length === 0) return [];
		return Promise.all(
			files.map((file) => this.uploadImage(file, folderPath)),
		);
	}

	async deleteImages(publicIds: string[]): Promise<void> {
		if (!publicIds || publicIds.length === 0) return;
		await cloudinary.api.delete_resources(publicIds, {
			resource_type: 'image',
			invalidate: true,
		});
	}

	async rollbackFolder(folderPath: string): Promise<void> {
		if (!folderPath) return;
		try {
			await cloudinary.api.delete_resources_by_prefix(folderPath);
			await cloudinary.api.delete_folder(folderPath);
			this.logger.log(`Rolled back Cloudinary folder: ${folderPath}`);
		} catch (error) {
			this.logger.error(
				`Cloudinary rollback failed for ${folderPath}:`,
				(error as Error).message,
			);
		}
	}
  async rollbackSingleFile(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    // uploader.destroy deletes a single asset by its public_id
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      this.logger.log(`Successfully deleted Cloudinary file: ${publicId}`);
    } else {
      this.logger.warn(`Cloudinary file deletion returned status: ${result.result} for ${publicId}`);
    }
  } catch (error) {
    this.logger.error(
      `Cloudinary single file rollback failed for ${publicId}:`,
      (error as Error).message,
    );
  }
}
	async rollbackFolderFiles(folderPath: string): Promise<void> {
		if (!folderPath) return;
		try {
			// This deletes all assets (images, videos, etc.) matching the prefix
			await cloudinary.api.delete_resources_by_prefix(folderPath);

			this.logger.log(
				`Cleared all files in Cloudinary folder: ${folderPath}`,
			);
		} catch (error) {
			this.logger.error(
				`Cloudinary file rollback failed for ${folderPath}:`,
				(error as Error).message,
			);
		}
	}
}
