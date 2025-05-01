export function roundToNearestValue(valueBI: BigInt, nearestValues: number[]): number {
    const value = Number(valueBI);
    if (nearestValues.length === 0) {
        throw new Error("nearestValues array cannot be empty");
    }

    // Sort the nearest values in ascending order
    nearestValues.sort((a, b) => a - b);

    // Find the closest value
    let closestValue = nearestValues[0];
    let minDiff = Math.abs(value - closestValue);

    for (let i = 1; i < nearestValues.length; i++) {
        const currentValue = nearestValues[i];
        const currentDiff = Math.abs(value - currentValue);

        if (currentDiff < minDiff) {
            minDiff = currentDiff;
            closestValue = currentValue;
        }
    }

    return closestValue;
}