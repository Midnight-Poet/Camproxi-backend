import { Injectable } from '@nestjs/common';
import { HashtagProvider } from './hashtag.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashtagProvider {
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  public async comparePassword(
    plainPassword: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashPassword);
  }
}
