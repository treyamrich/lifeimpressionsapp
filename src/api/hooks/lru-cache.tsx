interface LRUCacheOptions<T> {
    name: string;
    maxSize: number;
    onEviction: (key: string) => void;
    onEvictAll?: (key: string) => void;
}

export class LRUCache<T> {
    private maxSize: number;
    private name: string;
    private onEviction: (key: string) => void;
    private cache: Set<string>;

    constructor(options: LRUCacheOptions<T>) {
        this.maxSize = options.maxSize;
        this.name = options.name;
        this.onEviction = options.onEviction;
        this.cache = new Set<string>();
    }

    add(key: string): void {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey && this.cache.delete(oldestKey)) {
                this.onEviction(oldestKey);
            }
        }
        this.cache.add(key);
    }

    evictAll(): void {
        this.cache.forEach((key) => {
            this.onEviction(key);
        });
        this.cache.clear();
    }

    keys(): string[] {
        return Array.from(this.cache);
    }
}