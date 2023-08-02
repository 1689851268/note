/*
 * @Description: 剑指 Offer II 029. 排序的循环链表
 * @Author: superman
 * @Date: 2022-06-16 20:32:22
 * @LastEditors: superman
 * @LastEditTime: 2022-07-09 12:19:19
 */

function Node(val, next) {
    this.val = val;
    this.next = next;
}

/**
 * @param {Node} head
 * @param {number} insertVal
 * @return {Node}
 */
var insert = function (head, val) {
    // 情况一: 空链表 —— 创建一个循环有序列表并返回这个节点
    if (!head) {
        const newNode = new Node(val);
        newNode.next = newNode;
        return newNode;
    }

    // 情况二：链表只有一个节点: 此情况其实是情况五的特例，因此代码可以省略

    let ptr = head;
    while (true) {
        // 情况三：正常情况 —— 最小值 <= 插入值 <= 最大值
        if (val >= ptr.val && val <= ptr.next.val) break;

        // 情况四：首尾相接 —— 插入值 <= 最小值 || 插入值 >= 最大值
        if (ptr.val > ptr.next.val && (val <= ptr.next.val || val >= ptr.val))
            break;

        // 情况五：死循环 —— 最小值 == 插入值 == 最大值
        if (ptr.next == head) break;

        ptr = ptr.next;
    }

    ptr.next = new Node(val, ptr.next);

    return head; // 返回原先给定的节点
};
