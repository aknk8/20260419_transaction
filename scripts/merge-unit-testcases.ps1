$srcPath = "docs\testcase-list-unit-src.md"
$serverPath = "docs\testcase-list-unit-server.md"
$outputPath = "docs\testcase-list-unit.md"

# --- Extract UNIT blocks from src file ---
$srcLines = [System.IO.File]::ReadAllLines((Join-Path (Get-Location) $srcPath))
$unitBlocks = @{}
$curId = $null
$curBlock = [System.Collections.Generic.List[string]]::new()

foreach ($line in $srcLines) {
    if ($line -match '^### (UNIT-\d{3})\b') {
        if ($curId) {
            while ($curBlock.Count -gt 0 -and $curBlock[$curBlock.Count-1] -eq '') { $curBlock.RemoveAt($curBlock.Count-1) }
            $unitBlocks[$curId] = $curBlock.ToArray()
        }
        $curId = $Matches[1]
        $curBlock = [System.Collections.Generic.List[string]]::new()
        $curBlock.Add($line)
    } elseif ($curId) {
        $curBlock.Add($line)
    }
}
if ($curId) {
    while ($curBlock.Count -gt 0 -and $curBlock[$curBlock.Count-1] -eq '') { $curBlock.RemoveAt($curBlock.Count-1) }
    $unitBlocks[$curId] = $curBlock.ToArray()
}
Write-Host "UNIT blocks extracted: $($unitBlocks.Count)"

# --- Extract server blocks (RT/ST/PT/IT/ReT) from server file ---
$serverLines = [System.IO.File]::ReadAllLines((Join-Path (Get-Location) $serverPath))
$serverBlocks = @{}
$curId = $null
$curBlock = [System.Collections.Generic.List[string]]::new()

foreach ($line in $serverLines) {
    $newId = $null
    $newFirstLine = $null

    if ($line -match '^\*\*((?:RT|ST|PT|IT)-\d{3})\*\*') {
        $newId = $Matches[1]
        $newFirstLine = "### $newId"
    } elseif ($line -match '^### (ReT-\d{3})\b') {
        $newId = $Matches[1]
        $newFirstLine = $line
    }

    if ($newId) {
        if ($curId) {
            while ($curBlock.Count -gt 0 -and $curBlock[$curBlock.Count-1] -eq '') { $curBlock.RemoveAt($curBlock.Count-1) }
            $serverBlocks[$curId] = $curBlock.ToArray()
        }
        $curId = $newId
        $curBlock = [System.Collections.Generic.List[string]]::new()
        $curBlock.Add($newFirstLine)
    } elseif ($curId) {
        # Skip section headings between blocks
        if ($line -match '^#{1,4} ') {
            # section divider, skip
        } else {
            $curBlock.Add($line)
        }
    }
}
if ($curId) {
    while ($curBlock.Count -gt 0 -and $curBlock[$curBlock.Count-1] -eq '') { $curBlock.RemoveAt($curBlock.Count-1) }
    $serverBlocks[$curId] = $curBlock.ToArray()
}
Write-Host "Server blocks extracted: $($serverBlocks.Count)"

# --- Build output ---
$out = [System.Collections.Generic.List[string]]::new()

function AddLine([string]$text) { $out.Add($text) }
function AddEmpty { $out.Add('') }
function AddUnit([string]$id) {
    if ($unitBlocks.ContainsKey($id)) {
        foreach ($l in $unitBlocks[$id]) { $out.Add($l) }
        $out.Add('')
    } else {
        Write-Warning "Missing: $id"
    }
}
function AddServer([string]$id) {
    if ($serverBlocks.ContainsKey($id)) {
        foreach ($l in $serverBlocks[$id]) { $out.Add($l) }
        $out.Add('')
    } else {
        Write-Warning "Missing: $id"
    }
}

AddLine "# ユニットテスト一覧"
AddEmpty
AddLine "フロントエンド（src/）およびバックエンド（server/）のユニットテストケースをまとめた一覧です。フロントエンドテストはビジネスロジックのドメインごとに分類し、バックエンドテストはテスト種別（RT/ST/PT/IT/ReT）ごとに整理しています。"
AddEmpty

# ===== Section 1: Frontend =====
AddLine "## 1. フロントエンドユニットテスト（src/）"
AddEmpty
AddLine "Vitestを使用したフロントエンドの純粋関数・ビジネスロジックのユニットテストです。"
AddEmpty

AddLine "### 1.1 承認ワークフロー（UNIT-001〜015）"
AddEmpty
1..15 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.2 マスタデータ（UNIT-016〜023, 075〜082）"
AddEmpty
16..23 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }
75..82 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.3 ダッシュボード（UNIT-024〜025）"
AddEmpty
24..25 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.4 伝票ドメイン"
AddEmpty

AddLine "#### 1.4.1 見積（UNIT-094〜105）"
AddEmpty
94..105 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "#### 1.4.2 受注（UNIT-053〜066）"
AddEmpty
53..66 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "#### 1.4.3 発注（UNIT-083〜093）"
AddEmpty
83..93 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "#### 1.4.4 請求（UNIT-033〜045）"
AddEmpty
33..45 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "#### 1.4.5 入金（UNIT-106〜111）"
AddEmpty
106..111 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "#### 1.4.6 支払依頼（UNIT-067〜074）"
AddEmpty
67..74 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "#### 1.4.7 納品（UNIT-026〜032）"
AddEmpty
26..32 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.5 通知（UNIT-046〜052）"
AddEmpty
46..52 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.6 レポート・集計（UNIT-112〜119）"
AddEmpty
112..119 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.7 設定・会計年度（UNIT-120〜122）"
AddEmpty
120..122 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.8 UIユーティリティ（UNIT-123〜125）"
AddEmpty
123..125 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

AddLine "### 1.9 ユーザー・バリデーション（UNIT-126〜131）"
AddEmpty
126..131 | ForEach-Object { AddUnit ("UNIT-{0:D3}" -f $_) }

# ===== Section 2: Backend =====
AddLine "## 2. バックエンドユニットテスト（server/）"
AddEmpty
AddLine 'Vitestを使用したバックエンドのユニットテストです。Fastify `app.inject()` によるHTTPルートテスト、サービス層・リポジトリ層の単体テスト、プラグインおよびインフラコンポーネントのテストを含みます。'
AddEmpty

# 2.1 RT
AddLine "### 2.1 ルートテスト（RT）"
AddEmpty
AddLine 'Fastify `app.inject()` を使用したHTTPエンドポイントのルートレベルテストです。'
AddEmpty

AddLine "#### 2.1.1 認証・セッション管理（RT-001〜021）"
AddEmpty
1..21 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.2 ヘルスチェック（RT-022〜025）"
AddEmpty
22..25 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.3 ユーザー管理（RT-026〜036）"
AddEmpty
26..36 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.4 商品マスタ（RT-037〜048）"
AddEmpty
37..48 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.5 顧客マスタ（RT-049〜062）"
AddEmpty
49..62 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.6 仕入先マスタ（RT-063〜074）"
AddEmpty
63..74 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.7 納品（RT-075〜083）"
AddEmpty
75..83 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.8 案件（RT-084〜090）"
AddEmpty
84..90 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.9 システム設定（RT-091〜095）"
AddEmpty
91..95 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.10 通知（RT-096〜103）"
AddEmpty
96..103 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.11 見積（RT-104〜117）"
AddEmpty
104..117 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.12 受注（RT-118〜122）"
AddEmpty
118..122 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.13 発注（RT-123〜127）"
AddEmpty
123..127 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.14 請求（RT-128〜150）"
AddEmpty
128..150 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.15 支払（RT-151〜159）"
AddEmpty
151..159 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.16 入金（RT-160〜163）"
AddEmpty
160..163 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.17 承認一覧（RT-164〜174）"
AddEmpty
164..174 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

AddLine "#### 2.1.18 承認経路管理（RT-175〜182）"
AddEmpty
175..182 | ForEach-Object { AddServer ("RT-{0:D3}" -f $_) }

# 2.2 ST
AddLine "### 2.2 サービステスト（ST）"
AddEmpty
AddLine "サービス層のビジネスロジックをDIパターンでモックを注入してテストします。"
AddEmpty

AddLine "#### 2.2.1 認証サービス（ST-001〜009）"
AddEmpty
1..9 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.2 ユーザーサービス・パスワードポリシー（ST-010〜021）"
AddEmpty
10..21 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.3 リフレッシュトークンサービス（ST-022〜025）"
AddEmpty
22..25 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.4 通知サービス（ST-026〜032）"
AddEmpty
26..32 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.5 設定・連番サービス（ST-033〜037）"
AddEmpty
33..37 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.6 承認サービス（ST-038〜042）"
AddEmpty
38..42 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.7 見積サービス（ST-043〜048）"
AddEmpty
43..48 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.8 請求サービス（ST-049〜055）"
AddEmpty
49..55 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.9 支払サービス（ST-056〜060）"
AddEmpty
56..60 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.10 入金サービス（ST-061〜065）"
AddEmpty
61..65 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.11 受注サービス（ST-066〜070）"
AddEmpty
66..70 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

AddLine "#### 2.2.12 その他サービス（ST-071〜080）"
AddEmpty
71..80 | ForEach-Object { AddServer ("ST-{0:D3}" -f $_) }

# 2.3 PT
AddLine "### 2.3 プラグインテスト（PT）"
AddEmpty
AddLine "Fastifyプラグインの動作をユニットテストします。"
AddEmpty

AddLine "#### 2.3.1 認可プラグイン（PT-001〜006）"
AddEmpty
1..6 | ForEach-Object { AddServer ("PT-{0:D3}" -f $_) }

AddLine "#### 2.3.2 監査ログプラグイン（PT-007〜012）"
AddEmpty
7..12 | ForEach-Object { AddServer ("PT-{0:D3}" -f $_) }

AddLine "#### 2.3.3 セキュリティプラグイン（PT-013〜017）"
AddEmpty
13..17 | ForEach-Object { AddServer ("PT-{0:D3}" -f $_) }

AddLine "#### 2.3.4 CSRFプラグイン（PT-018〜023）"
AddEmpty
18..23 | ForEach-Object { AddServer ("PT-{0:D3}" -f $_) }

AddLine "#### 2.3.5 スロークエリプラグイン（PT-024〜026）"
AddEmpty
24..26 | ForEach-Object { AddServer ("PT-{0:D3}" -f $_) }

# 2.4 IT
AddLine "### 2.4 インフラテスト（IT）"
AddEmpty
AddLine "インフラストラクチャコンポーネント（起動ガード・DBトランザクション・ページネーション・インデックス・バッチジョブ）のテストです。"
AddEmpty

AddLine "#### 2.4.1 起動ガード（IT-001〜004）"
AddEmpty
1..4 | ForEach-Object { AddServer ("IT-{0:D3}" -f $_) }

AddLine "#### 2.4.2 DBトランザクション（IT-005〜008）"
AddEmpty
5..8 | ForEach-Object { AddServer ("IT-{0:D3}" -f $_) }

AddLine "#### 2.4.3 ページネーション（IT-009〜011）"
AddEmpty
9..11 | ForEach-Object { AddServer ("IT-{0:D3}" -f $_) }

AddLine "#### 2.4.4 DBインデックス（IT-012〜014）"
AddEmpty
12..14 | ForEach-Object { AddServer ("IT-{0:D3}" -f $_) }

AddLine "#### 2.4.5 バッチジョブ（IT-015〜019）"
AddEmpty
15..19 | ForEach-Object { AddServer ("IT-{0:D3}" -f $_) }

# 2.5 ReT
AddLine "### 2.5 リポジトリテスト（ReT）"
AddEmpty
AddLine "リポジトリ層のデータアクセスロジックをテストします。"
AddEmpty

AddLine "#### 2.5.1 見積リポジトリ（ReT-001〜007）"
AddEmpty
1..7 | ForEach-Object { AddServer ("ReT-{0:D3}" -f $_) }

AddLine "#### 2.5.2 ユーザーリポジトリ（ReT-008〜018）"
AddEmpty
8..18 | ForEach-Object { AddServer ("ReT-{0:D3}" -f $_) }

AddLine "#### 2.5.3 セッションリポジトリ（ReT-019〜022）"
AddEmpty
19..22 | ForEach-Object { AddServer ("ReT-{0:D3}" -f $_) }

# Write output
$encoding = [System.Text.UTF8Encoding]::new($false)  # UTF-8 without BOM
[System.IO.File]::WriteAllLines((Join-Path (Get-Location) $outputPath), $out, $encoding)
Write-Host "Written: $outputPath ($($out.Count) lines)"
