/*
 * @Description: 
 * @Author: superman
 * @Date: 2022-03-07 10:20:56
 * @LastEditors: superman
 * @LastEditTime: 2022-03-25 19:34:50
 */
let s = "axc",
    t = "ahbgdc";

var isSubsequence = function (s, t) {
    const [m, n] = [s.length, t.length];
    if (m > n) return false;
    if (m == 0) return true;

    let k = 0;
    for (let i = 0; i < t.length; i++) {
        if (t[i] === s[k]) k++;
    }
    return k === s.length;
};

console.log(isSubsequence(s, t));


// var isSubsequence = function (s, t) {
//     const [m, n] = [s.length, t.length]
//     if (m > n) return false;
//     if (m == 0) return true;

//     let index = -1;
//     for (let i = 0; i < sl; i++) {
//         index = t.indexOf(s.charAt(i), index + 1);
//         if (index == -1)
//             return false;
//     }
//     return true;
// };