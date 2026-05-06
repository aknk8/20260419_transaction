#!/usr/bin/env node
/**
 * INF-07: ステージングデータ投入スクリプト
 * 各テーブルに1,000件以上のデータを生成し、EXPLAIN ANALYZE 実行環境を整備する。
 *
 * 使用方法:
 *   node scripts/seed-staging.js | psql $DATABASE_URL
 *   # または
 *   node scripts/seed-staging.js > staging-seed.sql
 *   psql $DATABASE_URL -f staging-seed.sql
 */

const CUSTOMERS = 100;
const SUPPLIERS = 50;
const PRODUCTS  = 200;
const PROJECTS  = 30;
const QUOTATIONS = 1000;
const ORDERS     = 1000;
const PURCHASE_ORDERS = 1000;
const INVOICES   = 1000;
const PAYMENTS   = 500;
const DELIVERIES = 800;

const STATUSES_QUOTATION = ['下書き', '承認依頼中', '承認済み', '却下'];
const STATUSES_ORDER     = ['受注済み', '承認依頼中', '承認済み', '却下'];
const STATUSES_PO        = ['下書き', '承認依頼中', '承認済み', '却下', '納品済み'];
const STATUSES_INVOICE   = ['下書き', '承認依頼中', '確定', '消込済み', '一部消込', '却下'];
const STATUSES_PAYMENT   = ['下書き', '承認依頼中', '承認済み', '却下'];
const CLOSING_DAYS       = ['末日', '15日', '20日', '25日'];

const pad  = (n, len = 5) => String(n).padStart(len, '0');
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const date = (offsetDays = 0) => {
  const d = new Date('2026-01-01');
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};
const amount = (min, max) => (Math.floor(Math.random() * (max - min)) + min) * 1000;

const lines = ['BEGIN;', ''];

// ── 顧客 ─────────────────────────────────────────────────────────────────
lines.push('-- 顧客マスタ');
for (let i = 1; i <= CUSTOMERS; i++) {
  lines.push(
    `INSERT INTO customers(code,name,department,closing_day,payment_site,status,created_at,updated_at) VALUES ` +
    `('CUS-S${pad(i)}','ステージング顧客${i}','営業部',` +
    `'${pick(CLOSING_DAYS)}','30日','有効',NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 仕入先 ────────────────────────────────────────────────────────────────
lines.push('-- 仕入先マスタ');
for (let i = 1; i <= SUPPLIERS; i++) {
  lines.push(
    `INSERT INTO suppliers(code,name,payment_site,status,created_at,updated_at) VALUES ` +
    `('SUP-S${pad(i)}','ステージング仕入先${i}','60日','有効',NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 商品 ──────────────────────────────────────────────────────────────────
lines.push('-- 商品マスタ');
for (let i = 1; i <= PRODUCTS; i++) {
  const price = amount(10, 100);
  lines.push(
    `INSERT INTO products(code,name,unit,unit_price,tax,status,created_at,updated_at) VALUES ` +
    `('PRD-S${pad(i)}','ステージング商品${i}','個',${price},0.10,'有効',NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── プロジェクト ──────────────────────────────────────────────────────────
lines.push('-- プロジェクト');
for (let i = 1; i <= PROJECTS; i++) {
  const cust = `CUS-S${pad(Math.ceil(Math.random() * CUSTOMERS))}`;
  lines.push(
    `INSERT INTO projects(code,name,customer_id,status,start_date,created_at,updated_at) VALUES ` +
    `('PRJ-S${pad(i)}','ステージングプロジェクト${i}','${cust}','進行中','${date(i)}',NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 見積 ──────────────────────────────────────────────────────────────────
lines.push('-- 見積');
for (let i = 1; i <= QUOTATIONS; i++) {
  const cust   = `CUS-S${pad(Math.ceil(Math.random() * CUSTOMERS))}`;
  const status = pick(STATUSES_QUOTATION);
  const sub    = amount(100, 5000);
  const tax    = Math.floor(sub * 0.1);
  lines.push(
    `INSERT INTO quotations(code,customer_id,title,issue_date,status,subtotal,tax_amount,total,created_at,updated_at) VALUES ` +
    `('QUO-S${pad(i)}','${cust}','ステージング見積${i}','${date(i % 365)}','${status}',${sub},${tax},${sub + tax},NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 受注 ──────────────────────────────────────────────────────────────────
lines.push('-- 受注');
for (let i = 1; i <= ORDERS; i++) {
  const cust   = `CUS-S${pad(Math.ceil(Math.random() * CUSTOMERS))}`;
  const status = pick(STATUSES_ORDER);
  const sub    = amount(200, 10000);
  const tax    = Math.floor(sub * 0.1);
  lines.push(
    `INSERT INTO orders(code,customer_id,title,order_date,status,subtotal,tax_amount,total,billing_target,paid_amount,created_at,updated_at) VALUES ` +
    `('ORD-S${pad(i)}','${cust}','ステージング受注${i}','${date(i % 365)}','${status}',${sub},${tax},${sub + tax},false,0,NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 発注 ──────────────────────────────────────────────────────────────────
lines.push('-- 発注');
for (let i = 1; i <= PURCHASE_ORDERS; i++) {
  const sup    = `SUP-S${pad(Math.ceil(Math.random() * SUPPLIERS))}`;
  const status = pick(STATUSES_PO);
  const sub    = amount(100, 8000);
  const tax    = Math.floor(sub * 0.1);
  lines.push(
    `INSERT INTO purchase_orders(code,supplier_id,title,order_date,status,subtotal,tax_amount,total,created_at,updated_at) VALUES ` +
    `('POD-S${pad(i)}','${sup}','ステージング発注${i}','${date(i % 365)}','${status}',${sub},${tax},${sub + tax},NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 請求 ──────────────────────────────────────────────────────────────────
lines.push('-- 請求');
for (let i = 1; i <= INVOICES; i++) {
  const cust   = `CUS-S${pad(Math.ceil(Math.random() * CUSTOMERS))}`;
  const status = pick(STATUSES_INVOICE);
  const sub    = amount(200, 10000);
  const tax    = Math.floor(sub * 0.1);
  const due    = date((i % 365) + 30);
  lines.push(
    `INSERT INTO invoices(code,customer_id,title,invoice_date,due_date,status,subtotal,tax_amount,total,created_at,updated_at) VALUES ` +
    `('INV-S${pad(i)}','${cust}','ステージング請求${i}','${date(i % 365)}','${due}','${status}',${sub},${tax},${sub + tax},NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 支払依頼 ──────────────────────────────────────────────────────────────
lines.push('-- 支払依頼');
for (let i = 1; i <= PAYMENTS; i++) {
  const sup    = `SUP-S${pad(Math.ceil(Math.random() * SUPPLIERS))}`;
  const status = pick(STATUSES_PAYMENT);
  const amt    = amount(100, 5000);
  lines.push(
    `INSERT INTO payments(code,supplier_id,title,payment_date,amount,status,created_at,updated_at) VALUES ` +
    `('PAY-S${pad(i)}','${sup}','ステージング支払${i}','${date(i % 365)}',${amt},'${status}',NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

// ── 納品 ──────────────────────────────────────────────────────────────────
lines.push('-- 納品');
for (let i = 1; i <= DELIVERIES; i++) {
  lines.push(
    `INSERT INTO deliveries(code,delivery_date,status,created_at,updated_at) VALUES ` +
    `('DEL-S${pad(i)}','${date(i % 365)}','検収済',NOW(),NOW()) ON CONFLICT DO NOTHING;`
  );
}
lines.push('');

lines.push('COMMIT;');
lines.push('');
lines.push(`-- 生成件数サマリ`);
lines.push(`-- customers: ${CUSTOMERS}, suppliers: ${SUPPLIERS}, products: ${PRODUCTS}`);
lines.push(`-- projects: ${PROJECTS}, quotations: ${QUOTATIONS}, orders: ${ORDERS}`);
lines.push(`-- purchase_orders: ${PURCHASE_ORDERS}, invoices: ${INVOICES}`);
lines.push(`-- payments: ${PAYMENTS}, deliveries: ${DELIVERIES}`);

process.stdout.write(lines.join('\n') + '\n');
