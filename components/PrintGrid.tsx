import type { PrintModel } from "@/lib/types";

export default function PrintGrid({
  models,
  onRemove,
}: {
  models: PrintModel[];
  onRemove?: (id: string) => void;
}) {
  if (models.length === 0) {
    return (
      <div className="empty">
        <h2>No saved prints yet</h2>
        <p>Swipe right on the Discover tab to save prints here.</p>
      </div>
    );
  }
  return (
    <div className="grid">
      {models.map((m) => (
        <div className="gcard" key={m.id}>
          <img src={m.thumbnail} alt={m.title} />
          <div className="gmeta">
            <p className="gtitle">{m.title}</p>
            <div className="glinks">
              <a href={m.sourceUrl} target="_blank" rel="noreferrer">Source</a>
              {m.downloadUrl && (
                <a href={m.downloadUrl} target="_blank" rel="noreferrer">Download</a>
              )}
              {onRemove && (
                <button className="remove" onClick={() => onRemove(m.id)}>Remove</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
