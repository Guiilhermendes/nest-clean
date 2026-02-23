import { HashComparer } from "@/domain/forum/application/cryptography/hash-comparer";
import { HashGenerator } from "@/domain/forum/application/cryptography/hash-generator";
import { Injectable } from "@nestjs/common";
import { hash, compare } from "bcryptjs";

@Injectable()
export class BycryptHasher implements HashGenerator, HashComparer {
    private HASH_SALT_LENGTH = 8;

    hash(plan: string): Promise<string> {
        return hash(plan, this.HASH_SALT_LENGTH);
    }
    
    compare(plan: string, hash: string): Promise<boolean> {
        return compare(plan, hash)
    }
}