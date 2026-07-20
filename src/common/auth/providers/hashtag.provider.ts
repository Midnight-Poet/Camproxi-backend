import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashtagProvider {
  abstract hashPassword(data: string): Promise<string>;

  abstract comparePassword(
    plainPassword: string,
    hashPassword: string,
  ): Promise<boolean>;
}
