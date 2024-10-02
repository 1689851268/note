/*
 * @Description:
 * @Author: superman
 * @Date: 2022-06-08 09:19:22
 * @LastEditors: superman
 * @LastEditTime: 2022-06-08 09:27:57
 */

/**
 *  给定一个数组 points , 其中 points[i] = [xi, yi] 表示 X-Y 平面上的一个点, 如果这些点构成一个 [回旋镖] 则返回 true
 *  [回旋镖] 定义为一组三个点, 这些点 "各不相同" 且 "不在一条直线上"
 */

/**
 * @param {number[][]} points
 * @return {boolean}
 */
var isBoomerang = function (points) {
    // 假设 3 个点 A(x1, y1) B(x2, y2) C(x3, y3)
    // 有向量 AB = (x2 - x1, y2 - y1), BC = (x3 - x2, y3 - y2)
    let AB = [points[1][0] - points[0][0], points[1][1] - points[0][1]];
    let BC = [points[2][0] - points[1][0], points[2][1] - points[1][1]];

    // 若 ABC 三点共线, 则有 AB * BC = 0
    // 向量相乘公式: A * B = x1 * y2 - x2 * y1
    // 则 AB * BC = (x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2)
    return AB[0] * BC[1] - AB[1] * BC[0] != 0;
};
