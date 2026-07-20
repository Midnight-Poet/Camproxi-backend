import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
	@IsOptional()
	@IsBoolean()
	isAvailable?: boolean;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	imagesToDelete?: string[] | string;

	@IsOptional()
	@IsString()
	coverImageId?: string;

	@IsString()
	productId!: string;
}
