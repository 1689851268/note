/*
 * @Description:
 * @Author: superman
 * @Date: 2022-03-07 10:20:56
 * @LastEditors: superman
 * @LastEditTime: 2022-03-25 20:01:00
 */
let arr = [0, 1, 0, 1, 0];

const isPlace = arr => {
    let str = arr.join('');
    let placeArr = str.split('1');
    console.log('placeArr', placeArr);

    let distance = 0;
    for (const i of placeArr) {
        if (distance < i.length) distance = i.length;
    }
    distance = Math.ceil(distance / 2);

    return distance;
};

console.log(isPlace(arr));

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
