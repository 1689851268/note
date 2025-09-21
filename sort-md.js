/*
    最小可用脚本: 递归扫描当前工作目录, 在每个子目录内对以两位数字加点开头
    的 Markdown 文件进行排序, 示例: "01. 标题.md". 
    重命名为按标题排序后的序号格式: "NN. 标题.md"(点后带空格). 
    为避免命名冲突, 使用两阶段(临时名 -> 目标名)重命名. 支持 --dry-run 预览. 
*/

const fs = require("fs/promises");
const path = require("path");

/**
 * 配置
 */
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

const DRY_RUN = process.argv.includes("--dry-run"); // 是否仅预览不实际重命名

/**
 * 工具函数
 */
function isMdFile(name) {
    return name.toLowerCase().endsWith(".md");
}

function matchesIndexedMd(name) {
    // 以两位数字和一个点开头, 结尾为 .md 的文件
    // 示例: "01.xxx.md", "07.  标题.md"
    return /^\d{2}\..*\.md$/i.test(name);
}

function extractTitleFromIndexedName(name) {
    // 去掉前缀的 NN. 及其后紧随的空格
    const withoutPrefix = name.replace(/^\d{2}\.\s*/, "");
    // 去掉 .md 扩展名
    const withoutExt = withoutPrefix.replace(/\.md$/i, "");
    // 规范化空白字符
    return collapseWhitespace(withoutExt.trim());
}

function collapseWhitespace(str) {
    return str.replace(/\s+/g, " ");
}

function sanitizeWindowsFilenameComponent(str) {
    // 替换 Windows 不允许的字符 <>:"/\|?* 以及控制字符
    const replaced = str.replace(/[<>:"/\\|?*]/g, " ").replace(/[\u0000-\u001F]/g, " ");
    // 去除结尾的空格或点 (Windows 文件名不允许)
    return replaced.replace(/[ .]+$/g, "");
}

function pad2(n) {
    return String(n).padStart(2, "0");
}

function compareTitles(a, b) {
    // 使用中文区域优先, 退化到英文; numeric:true 以获得更自然的数字排序
    return a.localeCompare(b, ["zh", "en"], { numeric: true, sensitivity: "base" });
}

async function pathExists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

/**
 * 核心流程
 */
async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const subDirs = [];
    const indexedMdFiles = [];

    for (const d of entries) {
        const name = d.name;
        if (d.isDirectory()) {
            if (IGNORED_DIRECTORIES.has(name)) continue;
            // 默认跳过隐藏目录
            if (name.startsWith(".")) continue;
            subDirs.push(path.join(dir, name));
            continue;
        }

        if (!d.isFile()) continue;

        if (isMdFile(name) && matchesIndexedMd(name)) {
            const absPath = path.join(dir, name);
            const title = extractTitleFromIndexedName(name);
            indexedMdFiles.push({ absPath, dir, name, title });
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

async function renameIndexedFilesInDirectory(files) {
    const relDir = path.relative(process.cwd(), files[0].dir) || ".";

    // 按标准化后的标题进行本地化比较排序
    const sorted = [...files].sort((a, b) => compareTitles(a.title, b.title));

    // 生成最终目标文件名, 保证在该目录内唯一
    const usedNames = new Set();
    const plan = [];

    for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        if (i >= 99) {
            const relPath = path.join(relDir, item.name);
            const msg = `[skip] ${relPath}: 超过 99 个条目, 保留原名.`;
            if (DRY_RUN) console.log(`[dry-run] ${msg}`);
            else console.warn(msg);
            continue;
        }
        const index = pad2(i + 1);
        const cleanTitle = sanitizeWindowsFilenameComponent(item.title) || "Untitled";
        let targetBase = `${index}. ${cleanTitle}.md`;

        // 若标题相同导致目标名冲突, 追加 (2)、(3)... 后缀确保唯一
        if (usedNames.has(targetBase.toLowerCase())) {
            let suffix = 2;
            while (usedNames.has(`${index}. ${cleanTitle} (${suffix}).md`.toLowerCase())) {
                suffix++;
            }
            targetBase = `${index}. ${cleanTitle} (${suffix}).md`;
        }
        usedNames.add(targetBase.toLowerCase());

        const targetAbs = path.join(item.dir, targetBase);
        plan.push({ fromAbs: item.absPath, toAbs: targetAbs, fromName: item.name, toName: targetBase, dir: item.dir });
    }

    // 过滤掉源目标相同的无操作重命名
    const changes = plan.filter((p) => path.normalize(p.fromAbs) !== path.normalize(p.toAbs));

    if (changes.length === 0) {
        if (DRY_RUN) {
            console.log(`[dry-run] ${relDir}: 已经是有序且规范化的命名, 无需改动.`);
        }
        return;
    }

    // 两阶段重命名: 先改为临时唯一文件名以避免冲突
    const tempSuffix = `.tmp-renaming-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
        c.tmpAbs = candidate;
        try {
            await fs.rename(c.fromAbs, c.tmpAbs);
        } catch (err) {
            console.error(`重命名到临时名失败: ${path.join(relDir, c.fromName)} -> ${path.basename(c.tmpAbs)}\n`, err);
            throw err;
        }
    }

    // 阶段 2: 从临时名改为最终目标名
    for (const c of temps) {
        // 若目标名已存在(例如目录中原本就有同名文件), 则在目标名末尾追加 (2)、(3)...
        let target = c.toAbs;
        let n = 2;
        while (await pathExists(target)) {
            const dir = path.dirname(c.toAbs);
            const baseName = path.basename(c.toAbs, ".md");
            target = path.join(dir, `${baseName} (${n}).md`);
            n++;
        }
        try {
            await fs.rename(c.tmpAbs, target);
            const relFrom = path.join(relDir, c.fromName);
            const relTo = path.relative(process.cwd(), target);
            console.log(`${relFrom} -> ${relTo}`);
        } catch (err) {
            console.error(`设置目标名失败: ${path.basename(c.tmpAbs)} -> ${path.basename(target)}\n`, err);
            throw err;
        }
    }
}

async function main() {
    const cwd = process.cwd();
    await processDirectory(cwd);
}

main().catch((err) => {
    console.error("执行出错:", err);
    process.exitCode = 1;
});
