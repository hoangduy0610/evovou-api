// Helper function to sort object keys
export function sortObject(obj: Record<string, any>) {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}