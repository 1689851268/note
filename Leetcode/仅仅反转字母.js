/*
 * @Description: 
 * @Author: superman
 * @Date: 2022-02-23 18:33:33
 * @LastEditors: superman
 * @LastEditTime: 2022-02-23 20:33:40
 */

var reverseOnlyLetters = function (s) {
    const n = s.length;
    const arr = [...s]; // 使用扩展运算符将字符串转成数组
    let left = 0,
        right = n - 1;
    while (true) {
        // `reg.test(str)` 可判断参数 `str` 中是否含有匹配正则的子字符串
        // `/^[a-zA-Z]+$/` 表示字母字符串
        while (left < right && !(/^[a-zA-Z]+$/.test(s[left]))) { // 判断左边是否扫描到字母
            left++;
        }
        while (right > left && !(/^[a-zA-Z]+$/.test(s[right]))) { // 判断右边是否扫描到字母
            right--;
        }
        if (left >= right) {
            break;
        }
        swap(arr, left, right); // 交换字母
        left++;
        right--;
    }
    return arr.join(''); // 将数组转成字符串
};

const swap = (arr, left, right) => {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
}


let str = "a-bC-dEf-ghIj";
console.log("原字符串：", str);
console.log("反转字符串：", reverseOnlyLetters(str));