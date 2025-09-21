/*
    最小可用脚本: 递归扫描当前工作目录, 在每个子目录内对以两位数字加点开头
    的 Markdown 文件进行排序, 示例: "01. 标题.md". 
    重命名为按标题排序后的序号格式: "NN. 标题.md"(点后带空格). 
    为避免命名冲突, 使用两阶段(临时名 -> 目标名)重命名. 支持 --dry-run 预览. 
*/

// 引入 Node.js 的文件系统 Promise 版 API
const fs = require("fs/promises");
// 引入路径处理模块
const path = require("path");

// 需要在扫描时忽略的目录集合
const IGNORED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    ".svn",
    ".hg",
    ".next",
    "dist",
    "build",
    "out",
    ".output",
]);

// 是否以演练模式运行 (仅打印计划, 不执行重命名)
const DRY_RUN = process.argv.includes("--dry-run"); // 是否仅预览不实际重命名

// 工具函数 - 判断是否为 .md 文件 (不区分大小写)
function isMdFile(name) {
    // 将扩展名转为小写后判断
    return name.toLowerCase().endsWith(".md");
}

// 工具函数 - 判断文件名是否以两位数字加一个点开头, 且以 .md 结尾
function matchesIndexedMd(name) {
    // 以两位数字和一个点开头, 结尾为 .md 的文件
    // 示例: "01.xxx.md", "07.  标题.md"
    return /^\d{2}\..*\.md$/i.test(name);
}

// 工具函数 - 从形如 "NN. 标题.md" 的文件名中提取标题部分
function extractTitleFromIndexedName(name) {
    // 去掉前缀的 NN. 及其后紧随的空格
    const withoutPrefix = name.replace(/^\d{2}\.\s*/, "");
    // 去掉 .md 扩展名
    const withoutExt = withoutPrefix.replace(/\.md$/i, "");
    // 规范化空白字符 (多个空白收敛为一个空格)
    return collapseWhitespace(withoutExt.trim());
}

// 工具函数 - 将连续空白字符折叠为一个空格
function collapseWhitespace(str) {
    return str.replace(/\s+/g, " ");
}

// 工具函数 - 从以两位数字开头的文件名中提取数字前缀 NN (01-99)
function extractIndexFromName(name) {
    const match = name.match(/^(\d{2})\./);
    return match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
}

// 工具函数 - 清洗 Windows 文件名中的非法字符并去除结尾空白/点
function sanitizeWindowsFilenameComponent(str) {
    // 替换 Windows 不允许的字符 <>:"/\|?* 以及控制字符
    const replaced = str.replace(/[<>:"/\\|?*]/g, " ").replace(/[\u0000-\u001F]/g, " ");
    // 去除结尾的空格或点 (Windows 文件名不允许)
    return replaced.replace(/[ .]+$/g, "");
}

// 工具函数 - 将数字转为两位字符串, 不足前补 0
function pad2(n) {
    return String(n).padStart(2, "0");
}

// 工具函数 - 比较两个标题字符串, 使用本地化排序(中文优先, 回退英文), 并启用自然数值排序
function compareTitles(a, b) {
    // 使用中文区域优先, 退化到英文; numeric:true 以获得更自然的数字排序
    return a.localeCompare(b, ["zh", "en"], { numeric: true, sensitivity: "base" });
}

// 工具函数 - 判断某个路径是否存在
async function pathExists(p) {
    try {
        // 若可访问, 返回 true
        await fs.access(p);
        return true;
    } catch {
        // 否则返回 false
        return false;
    }
}

// 核心流程 - 处理传入的目录: 收集子目录与需要排序的 .md 文件, 然后递归
async function processDirectory(dir) {
    // 读取目录条目, 返回 Dirent 对象数组, 便于判断类型
    const entries = await fs.readdir(dir, { withFileTypes: true });

    // 用于存放待递归处理的子目录绝对路径
    const subDirs = [];
    // 用于存放当前目录中匹配规则的 .md 文件信息
    const indexedMdFiles = [];

    // 遍历目录条目
    for (const d of entries) {
        // 获取条目名
        const name = d.name;
        // 若为目录
        if (d.isDirectory()) {
            // 跳过预定义忽略目录
            if (IGNORED_DIRECTORIES.has(name)) continue;
            // 默认跳过隐藏目录
            if (name.startsWith(".")) continue;
            // 记录子目录的绝对路径, 稍后递归
            subDirs.push(path.join(dir, name));
            continue;
        }

        // 非文件则跳过(如符号链接、设备等)
        if (!d.isFile()) continue;

        // 如果是 .md 文件且满足 "NN.*.md" 格式
        if (isMdFile(name) && matchesIndexedMd(name)) {
            // 拼出绝对路径
            const absPath = path.join(dir, name);
            // 提取标题部分
            const title = extractTitleFromIndexedName(name);
            // 提取两位数字前缀作为主排序键
            const indexNum = extractIndexFromName(name);
            // 收集该文件的信息, 供后续排序与重命名使用
            indexedMdFiles.push({ absPath, dir, name, title, indexNum });
        }
    }

    // 在该目录内排序并重命名
    if (indexedMdFiles.length > 0) {
        await renameIndexedFilesInDirectory(indexedMdFiles);
    }

    // 处理完当前目录后再递归子目录
    for (const sub of subDirs) {
        await processDirectory(sub);
    }
}

// 在同一目录内, 按标题排序并生成规范化的目标文件名, 然后两阶段重命名
async function renameIndexedFilesInDirectory(files) {
    // 计算目录的相对路径 (用于打印日志); 同目录时显示为 "."
    const relDir = path.relative(process.cwd(), files[0].dir) || ".";

    // 先按文件名前缀 NN 排序, 若 NN 相同再按标题进行本地化比较
    const sorted = [...files].sort((a, b) => {
        if (a.indexNum !== b.indexNum) return a.indexNum - b.indexNum;
        return compareTitles(a.title, b.title);
    });

    // 生成最终目标文件名, 保证在该目录内唯一
    const usedNames = new Set();
    // 计划表: 记录从原路径到目标路径的映射
    const plan = [];

    // 遍历排序后的文件
    for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        // 超过 99 个时跳过 (保持两位序号约束)
        if (i >= 99) {
            const relPath = path.join(relDir, item.name);
            const msg = `[skip] ${relPath}: 超过 99 个条目, 保留原名.`;
            if (DRY_RUN) console.log(`[dry-run] ${msg}`);
            else console.warn(msg);
            continue;
        }
        // 计算两位序号
        const index = pad2(i + 1);
        // 清洗标题以用于文件名, 为空时回退为 "Untitled"
        const cleanTitle = sanitizeWindowsFilenameComponent(item.title) || "Untitled";
        // 组合目标文件名: "NN. 标题.md"
        let targetBase = `${index}. ${cleanTitle}.md`;

        // 若标题相同导致目标名冲突, 追加 (2)、(3)... 后缀确保唯一
        if (usedNames.has(targetBase.toLowerCase())) {
            let suffix = 2;
            while (usedNames.has(`${index}. ${cleanTitle} (${suffix}).md`.toLowerCase())) {
                suffix++;
            }
            targetBase = `${index}. ${cleanTitle} (${suffix}).md`;
        }
        // 记录该目标名 (小写) 以检测冲突
        usedNames.add(targetBase.toLowerCase());

        // 生成目标绝对路径
        const targetAbs = path.join(item.dir, targetBase);
        // 写入重命名计划
        plan.push({ fromAbs: item.absPath, toAbs: targetAbs, fromName: item.name, toName: targetBase, dir: item.dir });
    }

    // 过滤掉源目标相同的无操作重命名
    const changes = plan.filter((p) => path.normalize(p.fromAbs) !== path.normalize(p.toAbs));

    // 若没有任何改动, 在 dry-run 模式下输出提示
    if (changes.length === 0) {
        if (DRY_RUN) {
            console.log(`[dry-run] ${relDir}: 已经是有序且规范化的命名, 无需改动.`);
        }
        return;
    }

    // 两阶段重命名: 先改为临时唯一文件名以避免冲突
    const tempSuffix = `.tmp-renaming-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // 为每个改动生成对应的临时文件名与路径
    const temps = changes.map((c, idx) => {
        const tmpName = `${c.fromName}${tempSuffix}-${idx}`;
        const tmpAbs = path.join(c.dir, tmpName);
        return { ...c, tmpName, tmpAbs };
    });

    // 阶段 0: 输出计划
    for (const c of changes) {
        const relFrom = path.join(relDir, c.fromName);
        const relTo = path.join(relDir, c.toName);
        if (DRY_RUN) {
            console.log(`[dry-run] ${relFrom} -> ${relTo}`);
        }
    }

    // 若为 dry-run 则提前返回, 不执行重命名
    if (DRY_RUN) return;

    // 阶段 1: 重命名为临时文件
    for (const c of temps) {
        // 极少数情况下临时名已存在, 则在临时名末尾追加数字避免冲突
        let candidate = c.tmpAbs;
        let n = 1;
        while (await pathExists(candidate)) {
            const ext = path.extname(c.tmpAbs);
            const base = path.basename(c.tmpAbs, ext);
            candidate = path.join(c.dir, `${base}-${n}${ext}`);
            n++;
        }
        // 使用最终确定的临时绝对路径
        c.tmpAbs = candidate;
        try {
            // 将原文件改名为临时文件
            await fs.rename(c.fromAbs, c.tmpAbs);
        } catch (err) {
            // 失败则打印错误并中断
            console.error(`重命名到临时名失败: ${path.join(relDir, c.fromName)} -> ${path.basename(c.tmpAbs)}\n`, err);
            throw err;
        }
    }

    // 阶段 2: 从临时名改为最终目标名
    for (const c of temps) {
        // 若目标名已存在 (例如目录中原本就有同名文件), 则在目标名末尾追加 (2)、(3)...
        let target = c.toAbs;
        let n = 2;
        while (await pathExists(target)) {
            const dir = path.dirname(c.toAbs);
            const baseName = path.basename(c.toAbs, ".md");
            target = path.join(dir, `${baseName} (${n}).md`);
            n++;
        }
        try {
            // 将临时文件改名为最终目标文件
            await fs.rename(c.tmpAbs, target);
            // 打印相对路径形式的重命名结果
            const relFrom = path.join(relDir, c.fromName);
            const relTo = path.relative(process.cwd(), target);
            console.log(`${relFrom} -> ${relTo}`);
        } catch (err) {
            // 失败则打印错误并中断
            console.error(`设置目标名失败: ${path.basename(c.tmpAbs)} -> ${path.basename(target)}\n`, err);
            throw err;
        }
    }
}

// 脚本入口: 从当前工作目录开始处理
async function main() {
    // 获取当前工作目录
    const cwd = process.cwd();
    // 从当前目录开始递归处理
    await processDirectory(cwd);
}

// 执行入口并捕获未处理的异常
main().catch((err) => {
    // 打印错误信息
    console.error("执行出错:", err);
    // 设置非零退出码
    process.exitCode = 1;
});
