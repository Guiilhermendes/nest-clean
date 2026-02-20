import { HashComparer } from "@/domain/forum/application/cryptography/hash-comparer";
import { HashGenerator } from "@/domain/forum/application/cryptography/hash-generator";

export class FakeHasher implements HashGenerator, HashComparer {
    async hash(plan: string): Promise<string> {
        return plan.concat("-hashed");
    }

    async compare(plan: string, hash: string): Promise<boolean> {
        return plan.concat("-hashed") === hash;
    }

}