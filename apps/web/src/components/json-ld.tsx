type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}
