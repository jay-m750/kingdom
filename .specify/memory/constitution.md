<!--
Sync Impact Report
- Version change: template default -> 1.0.0
- Modified principles:
	- template principle 1 -> I. 繁體中文優先
	- template principle 2 -> II. 簡潔設計優先
	- template principle 3 -> III. TDD 非協商原則
	- template principle 4 -> IV. 實作階段規格保護
	- template principle 5 -> V. 可部署導向的網站預設
- Added sections:
	- 其他約束
	- 開發流程與品質關卡
- Removed sections:
	- 無
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
- Deferred TODOs:
	- 無
-->

# Kingdom Constitution

## Core Principles

### I. 繁體中文優先
所有規格文件（至少包含 `spec.md`、`plan.md`、`tasks.md`）與代理回覆，預設 MUST 使用繁體中文。
若外部依賴或工具輸出為英文，可保留原文並附上必要中文說明。
理由：確保團隊溝通一致，降低規格理解落差。

### II. 簡潔設計優先
所有方案 MUST 以可驗證需求為界，不得預先實作未被需求驅動的抽象層或擴充點。
設計評估 SHOULD 先提出最小可行方案，再以證據決定是否擴充。
理由：避免過度設計，縮短交付週期並降低維護成本。

### III. TDD 非協商原則
實作 MUST 先寫測試，並明確經歷失敗（Red）後才可進入實作（Green）與重構（Refactor）。
`tasks.md` 中每個故事的測試任務 MUST 早於對應實作任務。
理由：以可執行規格驅動行為，降低回歸風險。

### IV. 實作階段規格保護
在 `speckit.implement` 階段，代理 MUST 保留並維護現有規格文件，不得刪除或覆蓋
`spec.md`、`plan.md`、`tasks.md` 的既有內容（除必要且可追溯的增量更新外）。
執行任務時 MUST 即時將已完成項目從 `[ ]` 更新為 `[x]`。
理由：確保需求追溯與執行狀態透明。

### V. 可部署導向的網站預設
若專案型態為網站，預設 MUST 以前端靜態網站為主，並可部署至 GitHub Pages。
若需求明確要求動態後端，才可偏離此原則，且 MUST 在 `plan.md` 說明理由。
理由：優先採用部署簡單、維運成本低的交付模式。

## 其他約束

- 各階段（specify、plan、tasks、implement）開始與結束時 MUST 執行 `git status --short --branch`。
- 進入重要合併前 SHOULD 執行 `git diff --stat` 以確認變更範圍符合任務。
- 若工作樹存在非本次任務修改，MUST 保留且不得任意回滾。

## 開發流程與品質關卡

1. 先以 `spec.md` 確認需求與驗收情境，內容使用繁體中文。
2. 於 `plan.md` 做憲章檢查，確認 TDD、簡潔設計、網站型態預設、git 檢查策略。
3. 於 `tasks.md` 將測試任務置於實作任務之前，並在 implement 時即時打勾。
4. 實作期間每個邏輯階段完成後執行測試與 git 狀態檢查。
5. 交付前檢查規格文件仍存在且內容未被模板覆蓋。

## Governance

本憲章優先於其他開發慣例；所有 PR 與審查 MUST 檢查是否符合核心原則。
修訂流程採 PR 提案，內容 MUST 說明變更動機、影響範圍與遷移方式。
版本政策採語意化版本：
- MAJOR：移除或重新定義核心原則造成不相容流程。
- MINOR：新增原則或新增具約束力章節。
- PATCH：文字澄清、錯字修正、無語意變更。
合規稽核：每次 `speckit.plan` 與 `speckit.implement` 前 MUST 重新檢查憲章。

**Version**: 1.0.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06
