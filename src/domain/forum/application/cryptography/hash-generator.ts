export abstract class HashGenerator {
    abstract hash(plan: string): Promise<string>
}