import { PrismaService } from "@app/database";
import { Injectable } from "@nestjs/common";
import { CreateUserRequestDTO } from "../../dtos/request/user-request";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
    constructor(private readonly db: PrismaService) {}

    async getuserByEmail(email: string) {
        return await this.db.user.findFirst({
            where: {
                email: email
            }
        })
    }

    async createUser(req: CreateUserRequestDTO) {
        await this.db.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            name: req.name,
            email: req.email,
            phone: req.phone,
            password_hash: await bcrypt.hash(req.password, 12),
          },
        });
      });
    }

}