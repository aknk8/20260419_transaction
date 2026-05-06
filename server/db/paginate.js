/**
 * INF-08: ページネーション共通ヘルパー
 * buildPaginatedQuery: PostgreSQL クエリ用（LIMIT/OFFSET）
 * paginateArray: in-memory 配列用（現行リポジトリ実装との互換）
 */

export function buildPaginatedQuery(baseQuery, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  return {
    dataQuery: `${baseQuery} LIMIT $2 OFFSET $3`,
    countQuery: `SELECT COUNT(*) FROM (${baseQuery}) t`,
    params: [limit, offset]
  };
}

export function paginateArray(arr, { page = 1, limit = 20 } = {}) {
  const total = arr.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = arr.slice(offset, offset + limit);
  return {
    data,
    meta: { total, page, pageSize: limit, totalPages }
  };
}
