# ADR-024: 批量退款技术方案修正

## 状态

Accepted

## 背景

Transactions API 文档核对中发现批量退款功能存在5项实现缺口，需要补充技术方案指导实现。

## 决策

### 1. 批量退款同步/异步切换阈值

**规则**: ≤10条同步处理，>10条异步Job

**实现要点**:
```typescript
// BatchRefundService.process()
async process(request: BatchRefundRequest): Promise<BatchRefundResponse> {
  if (request.items.length <= 10) {
    // 同步处理
    const result = await this.processSync(request.items);
    return {
      jobId: null,
      status: 'completed',
      results: result,
      completedAt: new Date()
    };
  } else {
    // 异步处理
    const job = await this.batchJobRepository.create({
      type: 'batch_refund',
      payload: request,
      status: 'pending',
      totalItems: request.items.length
    });
    await this.jobQueue.publish('batch.refund', job.id);
    return {
      jobId: job.id,
      status: 'pending',
      progress: 0
    };
  }
}
```

**状态码**:
- 同步: HTTP 200 + 完整结果
- 异步: HTTP 202 Accepted + jobId

---

### 2. 审批人分离校验

**规则**: 初审人与终审人（审核人）不能为同一人

**实现要点**:
```typescript
// RefundService.finalApprove()
async finalApprove(refundId: string, reviewerId: string): Promise<void> {
  const refund = await this.refundRepository.findById(refundId);
  
  if (!refund) {
    throw new NotFoundError('Refund not found');
  }
  
  if (refund.status !== 'pending_review') {
    throw new BusinessError('Refund not in review status');
  }
  
  // 核心校验
  if (refund.initialApproverId === reviewerId) {
    throw new BusinessError(
      'REVIEWER_SAME_AS_APPROVER',
      '初审人与审核人不能为同一人，请更换审核人'
    );
  }
  
  await this.refundRepository.update(refundId, {
    status: 'approved',
    reviewerId,
    reviewedAt: new Date()
  });
}
```

**数据模型变更**:
```sql
-- refunds 表新增字段
ALTER TABLE creditcard.refunds 
ADD COLUMN IF NOT EXISTS initial_approver_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS initial_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
```

---

### 3. 批量退款文件清理（P2）

**规则**: 7天后自动清理已完成/失败的批量退款文件

**实现要点**:
```typescript
// BatchRefundCleanupJob - 每日凌晨执行
@Cron('0 2 * * *') // 每天 2:00 AM
async cleanupExpiredFiles(): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const expiredFiles = await this.batchRefundFileRepository.find({
    where: {
      createdAt: LessThan(sevenDaysAgo),
      status: In(['completed', 'failed'])
    }
  });
  
  for (const file of expiredFiles) {
    // 1. 删除物理文件
    await this.fileStorage.delete(file.storagePath);
    
    // 2. 软删除记录（保留审计）
    await this.batchRefundFileRepository.update(file.id, {
      fileDeleted: true,
      fileDeletedAt: new Date()
    });
  }
  
  this.logger.info(`Cleaned up ${expiredFiles.length} expired batch refund files`);
}
```

---

### 4. 批量退款条数上限调整

**变更**: MaxRefundItems 50 → 100

**修改位置**:
1. `src/config/batch-refund.config.ts` - `maxItems: 100`
2. `src/modules/refund/dto/batch-refund.dto.ts` - `@Max(100)`
3. 数据库注释: `COMMENT ON COLUMN batch_refund_config.max_items IS 'Maximum 100 items per batch'`

---

### 5. Webhook 重试策略调整

**变更**: 10次/1s起始 → 5次/30s起始

**重试间隔**:
| 重试次数 | 延迟时间 |
|---------|---------|
| 第1次 | 30s |
| 第2次 | 1min |
| 第3次 | 2min |
| 第4次 | 5min |
| 第5次 | 10min |

**实现配置**:
```yaml
# config/webhook.yaml
webhook:
  retry:
    maxAttempts: 5
    initialIntervalMs: 30000  # 30s
    multiplier: 2
    maxIntervalMs: 600000     # 10min
```

---

## 实施计划

| 优先级 | 任务 | 负责人 | 截止 |
|-------|------|-------|------|
| P1 | 10条阈值同步/异步切换 | BE | 今天 |
| P1 | 审批人分离校验 | BE | 今天 |
| P1 | MaxRefundItems 100 | BE | 今天 |
| P1 | Webhook重试策略 | BE | 今天 |
| P2 | 文件7天清理定时任务 | BE | 本周 |

## 验证清单

- [ ] 9条批量退款返回 HTTP 200 同步结果
- [ ] 11条批量退款返回 HTTP 202 + jobId
- [ ] 同一人初审+终审被拒绝，返回 REVIEWER_SAME_AS_APPROVER
- [ ] Webhook 失败后在 30s/1m/2m/5m/10m 重试
- [ ] 批量退款配置 maxItems = 100

## 关联文档

- [04-transactions-business-rules.md](../../../docs/api/04-transactions-business-rules.md)
- [ADR-023: 风控服务 Fail-Open 策略](./ADR-023-risk-fail-open-strategy.md)

## 日期

2026-02-03
