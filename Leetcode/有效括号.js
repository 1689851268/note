// 复杂度分析:
// 时间复杂度: O(n), 其中 n 是字符串 str 的长度
// 空间复杂度: O(n + |Σ|), 其中 Σ 表示字符集, 本题中字符串只包含 6 种括号, |Σ| = 6
//     栈中的字符数量为 O(n), 而哈希表使用的空间为 O(|Σ|), 相加即可得到总空间复杂度

var isValid = function (str) {
    // 如果字符串长度为奇数, 则直接返回 false
    if (str.length % 2 === 1) {
        return false;
    }
    // 哈希表的键为右括号, 值为相同类型的左括号
    const pairs = new Map([
        [")", "("],
        ["]", "["],
        ["}", "{"],
    ]);
    const stk = [];
    for (let ch of str) {
        if (pairs.has(ch)) {
            // 拿右括号匹配栈内的左括号
            if (!stk.length || stk[stk.length - 1] !== pairs.get(ch)) {
                // 栈空 || 不是对应的左括号
                return false;
            }
            // 如果是对应的左括号, 则出栈
            stk.pop();
        } else {
            // 把左括号加到栈顶
            stk.push(ch);
        }
    }
    // 在遍历结束后, 如果栈中没有左括号, 说明我们将字符串 str 中的所有左括号闭合
    return !stk.length;
};

console.log(isValid("([)]"));
