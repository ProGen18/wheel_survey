export function safeJson(data, init) {
  const serialized = JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );
  return Response.json(serialized, init);
}
