function formatDate(date, fmt) {
    // 年
    let reg = /Y+/;
    if (reg.test(fmt)) {
        let str = fmt.match(reg)[0]; // 获取年份的格式
        // 使用 str.substring(start, end) 控制年份的表示长度与格式一致
        let year = (date.getFullYear() + '').substring(4 - str.length);
        fmt = fmt.replace(str, year); // 用年份替换格式字符串
    }

    // 月日时分秒
    let obj = {
        'M+': date.getMonth() + 1,
        'D+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }

    for (let key in obj) {
        let reg = new RegExp(key);
        if (reg.test(fmt)) {
            let str = fmt.match(reg)[0]; // 获取对应时间的格式
            fmt = fmt.replace(str, toTwo(obj[key])); // 用时间替换格式字符串
        }
    }

    return fmt;
}

function toTwo(num) {
    return (num > 10 ? '' : '0') + num;
}

let date = new Date();
let fmt = 'YYYY-MM-DD hh:mm:ss';
console.log(formatDate(date, fmt));