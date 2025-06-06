function calculatePartialDiscount(pointsToUse, userPoints) {
    const usablePoints = Math.min(pointsToUse, userPoints);
    const fullBlocks = Math.floor(usablePoints / 100);

    const discount = fullBlocks * 10;
    const pointsUsed = fullBlocks * 100;

    return { pointsUsed, discount };
}


module.exports = {
    calculatePartialDiscount,
};