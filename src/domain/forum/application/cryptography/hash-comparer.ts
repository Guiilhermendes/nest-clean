export abstract class HashComparer {
    abstract compare(plan: string, hash: string): Promise<boolean>
}