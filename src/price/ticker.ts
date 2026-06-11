export async function fetchMidPrice(productId: string): Promise<number> {
  const res = await fetch(`https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=${productId}&limit=1`);
  if (!res.ok) throw new Error(`ticker HTTP ${res.status}`);
  const body = (await res.json()) as {
    pricebook?: { bids?: { price: string }[]; asks?: { price: string }[] };
  };
  const bid = Number(body.pricebook?.bids?.[0]?.price);
  const ask = Number(body.pricebook?.asks?.[0]?.price);
  if (!Number.isFinite(bid) || !Number.isFinite(ask)) throw new Error('invalid BBO');
  return (bid + ask) / 2;
}
