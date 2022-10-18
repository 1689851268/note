```javascript
/* 定义参数 */
const config = {
    type: 'localStorage', // 本地存储类型 localStorage / sessionStorage
    prefix: 'SDF_0.0.1', // 名称前缀; 建议: 项目名 + 项目版本
    expire: 1, // 过期时间, 单位: 毫秒
    isEncrypt: true, // 默认加密; 为了调试方便, 开发过程中可以不加密
};

/* 判断是否支持 Storage */
export const isSupportStorage = () => {
    return typeof Storage !== 'undefined' ? true : false;
};

/* 设置缓存 setStorage */
export const setStorage = (key, value, expire = 0) => {
    if (value === '' || value === null || value === undefined) {
        value = null;
    }

    if (isNaN(expire) || expire < 1) throw new Error('Expire must be a number');

    expire = (expire ? expire : config.expire) * 60000;
    const data = {
        value, // 存储值
        time: Date.now(), // 存值时间戳
        expire, // 过期时间
    };

    // 对存储数据进行加密; 加密为可选配置
    const encryptString = config.isEncrypt ? encrypt(JSON.stringify(data)) : JSON.stringify(data);
    window[config.type].setItem(autoAddPrefix(key), encryptString);
};

/* 获取指定值 getStorage */
export const getStorage = key => {
    key = autoAddPrefix(key);

    // if key 不存在
    if (!window[config.type].getItem(key) || JSON.stringify(window[config.type].getItem(key)) === 'null') {
        return null;
    }

    // 对存储数据进行解密
    const storage = config.isEncrypt
        ? JSON.parse(decrypt(window[config.type].getItem(key)))
        : JSON.parse(window[config.type].getItem(key));

    // 过期删除, 并返回 null
    if (storage.expire && config.expire * 6000 < Date.now() - storage.time) {
        removeStorage(key);
        return null;
    } else {
        // 未过期期间被调用, 则自动续期, 进行保活
        setStorage(key, storage.value, config.expire);
        return storage.value;
    }
};

/* 获取所有值 getAllStorage */
export const getAllStorage = () => {
    const len = window[config.type].length; // 获取长度
    return new Array(len).map((_, i) => {
        const key = window[config.type].key(i);
        return { key, val: window[config.type].getItem(key) };
    });
};

/* 是否存在 hasStorage */
export const hasStorage = key => {
    const arr = getAllStorage().filter(item => item.key === autoAddPrefix(key));
    return arr.length ? true : false;
};

/* 获取所有 key */
export const getStorageKeys = () => {
    const items = getAllStorage();
    return items.map(item => item.key);
};

/* 名称前自动添加前缀 */
const autoAddPrefix = key => {
    const prefix = config.prefix ? config.prefix + '_' : '';
    return prefix + key;
};

/* 移除已添加的前缀 */
export const autoRemovePrefix = key => {
    const len = config.prefix ? config.prefix.length + 1 : '';
    return key.substr(len);
};

/* 删除指定缓存 removeStorage */
export const removeStorage = key => {
    window[config.type].removeItem(autoAddPrefix(key));
};

/* 清空缓存 clearStorage */
export const clearStorage = () => {
    window[config.type].clear();
};

/* 根据索引获取 key */
export const getStorageForIndex = index => {
    return window[config.type].key(index);
};

/* 获取 localStorage 长度 */
export const getStorageLength = () => {
    return window[config.type].length;
};
```

对系统安全性要求比较高，那么需要选择 https 协议来传输数据。当然很多情况下一般的 web 网站，如果安全要求不是很高的话，用 http 协议就可以了。在这种情况下，密码的明文传输显然是不合适的，因为如果请求在传输过程中被截了，就可以直接拿明文密码登录网站了

HTTPS (443) 在 HTTP (80) 的基础上加入了，SSL (Secure Sockets Layer 安全套接层) 协议，SSL 依靠证书来验证服务器的身份，并为浏览器和服务器之间的通信加密。传输前用公钥加密，服务器端用私钥解密

对于使用 http 协议的 web 前端的加密，只能防君子不能防小人。前端是完全暴露的，包括你的加密算法。知道了加密算法，密码都是可以解出的，只是时间问题。而为了保证数据库中存储的密码更安全，则需要在后端用多种单向（非对称）加密手段混合进行加密存储

前端加密后端又需要解密，所以需要对称加密算法，即前端使用 `encrypted = encrypt(password+key)`，后端使用 `password = decrypt(encrypted +key)`，前端只传输密码与 key 加密后的字符串 encrypted ，这样即使请求被拦截了，也知道了加密算法，但是由于缺少 key 所以很难解出明文密码。所以这个 key 很关键。而这个 key 是由后端控制生成与销毁的，用完即失效，所以即使可以模拟用加密后的密码来发请求模拟登录，但是 key 已经失效了，后端还是验证不过的

注意，如果本地环境本就是不安全的，key 被知道了，那就瞬间就可以用解密算法解出密码了。这里只是假设传输的过程中被截获的情形。所以前端加密是防不了小人的。如果真要防，可以将加密算法的 js 文件进行压缩加密，不断更新的手段来使 js 文件难以获取，让黑客难以获取加密算法。变态的 google 就是这么干的，自己实现一个 js 虚拟机，通过不断更新加密混淆 js 文件让加密算法难以获取。这样黑客不知道加密算法就无法解出了

常用的对称加密算法有 DES、3DES (TripleDES)、AES、RC2、RC4、RC5 和 Blowfis

```javascript
// 1. pnpm i crypto-js

// 2. 引入 crypto-js
const CryptoJS = require('crypto-js');

// 密钥: 十六位十六进制数
const SECRET_KEY = CryptoJS.enc.Utf8.parse('3333e6e143439161');
// 密钥偏移量: 十六位十六进制数
const SECRET_IV = CryptoJS.enc.Utf8.parse('e3bbe7e3ba84431a');

/* 加密 */
export function encrypt(data) {
    if (typeof data === 'object') {
        try {
            data = JSON.stringify(data);
        } catch (error) {
            console.log('encrypt error:', error);
        }
    }
    const dataHex = CryptoJS.enc.Utf8.parse(data);
    const encrypted = CryptoJS.AES.encrypt(dataHex, SECRET_KEY, {
        iv: SECRET_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString();
}

/* 解密 */
export function decrypt(data) {
    const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
    const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
        iv: SECRET_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}
```

