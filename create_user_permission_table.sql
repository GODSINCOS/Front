-- 创建用户权限直接关联表
USE training_server;

-- 创建 user_permission 表
CREATE TABLE IF NOT EXISTS user_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID', 
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_permission (user_id, permission_id) COMMENT '用户权限唯一索引',
    INDEX idx_user_id (user_id) COMMENT '用户ID索引',
    INDEX idx_permission_id (permission_id) COMMENT '权限ID索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户权限直接关联表';

-- 从现有的 RBAC 模型迁移数据到 user_permission 表
-- 通过 user_role 和 role_permission 表的关联，直接生成用户权限关系
INSERT INTO user_permission (user_id, permission_id)
SELECT DISTINCT 
    ur.user_id,
    rp.permission_id
FROM user_role ur
INNER JOIN role_permission rp ON ur.role_id = rp.role_id
ON DUPLICATE KEY UPDATE update_time = CURRENT_TIMESTAMP;

-- 查看迁移结果
SELECT 
    up.user_id,
    u.username,
    up.permission_id,
    p.code as permission_code,
    p.name as permission_name
FROM user_permission up
INNER JOIN user u ON up.user_id = u.id
INNER JOIN permission p ON up.permission_id = p.id
ORDER BY up.user_id, up.permission_id; 