export function zipToObject<K extends string, V>(
    keys: readonly K[],
    values: readonly V[]
): Record<K, V | undefined> {
    const obj = {} as Record<K, V | undefined>;

    keys.forEach((v, i) => {

        obj[v] = values[i];
    })
    return obj
}