import { Module } from "@nestjs/common";
import { JwtEncrypter } from "./jwt-encrypter";
import { BycryptHasher } from "./bycrypt-hasher";
import { Encrypter } from "@/domain/forum/application/cryptography/encrypter";
import { HashComparer } from "@/domain/forum/application/cryptography/hash-comparer";
import { HashGenerator } from "@/domain/forum/application/cryptography/hash-generator";

@Module({
    providers: [
        { provide: Encrypter, useClass: JwtEncrypter },
        { provide: HashComparer, useClass: BycryptHasher},
        { provide: HashGenerator, useClass: BycryptHasher}
    ],
    exports: [
        Encrypter,
        HashComparer,
        HashGenerator
    ]
})
export class CryptographyModule {}