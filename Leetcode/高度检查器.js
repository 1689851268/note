/*
 * @Description: 
 * @Author: superman
 * @Date: 2022-06-13 08:59:49
 * @LastEditors: superman
 * @LastEditTime: 2022-06-16 20:32:26
 */

/**
 * @param {number[]} heights
 * @return {number}
 */
var heightChecker = function (heights) {
    let expected = [...heights].sort((a, b) => a - b);
    return heights.reduce((pre, item, i) => {
        return pre + (item != expected[i]);
    }, 0);
};

let heights = [1, 1, 4, 2, 1, 3];
console.log(heightChecker(heights));