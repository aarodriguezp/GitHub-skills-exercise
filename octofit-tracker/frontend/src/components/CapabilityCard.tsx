import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type CapabilityItem = Record<string, unknown>;
type Props = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyMessage: string;
  renderItem: (item: CapabilityItem) => ReactNode;
};

function isRecord(value: unknown): value is CapabilityItem {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function CapabilityCard({ title, description, endpoint, dataKey, emptyMessage, renderItem }: Props) {
  const [items, setItems] = useState<CapabilityItem[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    getJson<unknown>(endpoint)
      .then((payload) => {
        if (!isRecord(payload) || !Array.isArray(payload[dataKey])) {
          throw new Error(`Invalid ${title.toLowerCase()} response`);
        }
        const records = payload[dataKey].filter(isRecord);
        if (records.length !== payload[dataKey].length) {
          throw new Error(`Invalid ${title.toLowerCase()} response`);
        }
        if (active) setItems(records);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : String(cause));
      });

    return () => {
      active = false;
    };
  }, [dataKey, endpoint, title]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === undefined ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((item, index) => <li className="list-group-item" key={String(item._id ?? index)}>{renderItem(item)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
