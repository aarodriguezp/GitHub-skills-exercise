import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  emptyText: string;
  load: () => Promise<T>;
  renderItems: (data: T) => ReactNode[];
};

export function CapabilityCard<T>({ title, description, emptyText, load, renderItems }: Props<T>) {
  const [data, setData] = useState<T | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    load()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setHasError(true);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const items = data === null ? [] : renderItems(data);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {hasError ? <p role="alert">Unable to load data.</p> : data === null ? (
          <p role="status">Loading...</p>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
        )}
      </div>
    </section>
  );
}
