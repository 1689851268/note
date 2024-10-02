# truncate 使用注意事项

1. truncate table 在功能上与不带 where 子句的 delete 语句相同, 二者都是删除表中的全部行. 但 truncate table 比 delete 速度快, 且使用的系统和事务日志资源少.
2. delete 语句每次删除一行, 并在事务日志中为所删除的每行记录一项. truncate table 通过释放存储表数据所用的数据页来删除数据, 并且只在事务日志中记录页的释放.
3. truncate table 删除表中的所有行, 但表结构及其列,约束,索引等保持不变. 新行标识所用的计数值重置为该列的种子. 如果想保留标识计数值, 请改用 delete. 如果要删除表定义及其数据, 请使用 drop table 语句.
4. 对于由 foreign key 约束引起的表, 不能使用 truncate table, 而应使用不带 where 自己的 delete 语句. 由于 truncate table 不记录在日志中, 所以它不能激活触发器.
5. truncate table 不能用于参与了索引视图的表.
6. 对用 truncate table 删除数据的表上增加数据时, 要使用 update statistics 来维护索引信息.
7. 如果有 rollback 语句, delete 操作将被撤销, 但 truncate 不会撤销.

<br><br>

# truncate & drop & delete

1. truncate 和 delete 只是删除表的数据, drop 语句将删除表的结构,被依赖的约束(constraint),触发器(trigger),索引(index); 依赖于该表的存储过程 / 函数将保留, 但是变为 invalid 状态.
2. delete 语句是 DML 语句, 这个操作会放在 rollback segement 中, 事物提交后才生效; 如果有相应的触发器(trigger), 执行的时候将被触发. truncate,drop 是 DDL 语言, 操作后立即生效, 原数据不会放到 rollback 中, 不能回滚, 操作不会触发 trigger
3. delete 语句不影响表所占用的 extent,高水线(high watermark) 保持原位置不动. drop 语句将表所占用的空间全部释放. truncate 语句缺省情况下将空间释放到 minextents 的 extent, 除非使用 reuse storage. truncate 会将高水线复位（回到最初）
4. 效率方面: drop > truncate > delete
5. 安全性: 小心使用 drop 和 truncate, 尤其是在没有备份的时候, 想删除部分数据可使用 delete 需要带上 where 子句, 回滚段要足够大, 想删除表可以用 drop, 想保留表只是想删除表的所有数据, 如果跟事物无关可以使用 truncate, 如果跟事物有关,或者想触发 trigger, 还是用 delete, 如果是整理表内部的碎片, 可以用 truncate 跟上 reuse storage, 再重新导入,插入数据.
6. delete 是 DML 语句, 不会自动提交. drop / truncate 是 DDL 语句, 执行后会自动提交.
7. drop 一般用于删除整体数据 eg:表,模式,索引,视图,完整性限制等... delete 用户删除局部性数据 eg:表中的某一元组
8. drop 把表结构都删了; delete 只是把数据清掉
9. 当不再需要该表时, 用 drop; 当你仍要保留该表, 但要删除所有记录时, 用 truncate; 当要删除部分记录时, 使用 delete

<br>
