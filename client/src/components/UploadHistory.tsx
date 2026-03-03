interface UploadResult {
    url: string;
    filename: string;
    size?: number;
    timestamp: number;
}

interface Props {
    history: UploadResult[];
    onClear: () => void;
}

export default function UploadHistory({ history, onClear }: Props) {
    if (history.length === 0) return null;

    const copyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const inp = document.createElement("input");
            inp.value = url;
            document.body.appendChild(inp);
            inp.select();
            document.execCommand("copy");
            document.body.removeChild(inp);
        }
    };

    return (
        <div className="history-section">
            <div className="history-header">
                <h2>Recent Uploads</h2>
                <button className="clear-btn" onClick={onClear}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Clear
                </button>
            </div>

            <div className="history-list">
                {history.map((item, i) => (
                    <div key={`${item.timestamp}-${i}`} className="history-item glass-card">
                        <div className="history-item-info">
                            <span className="history-filename" title={item.url}>
                                {item.url}
                            </span>
                            <span className="history-meta">
                                {item.size ? formatSize(item.size) + " · " : ""}
                                {formatTime(item.timestamp)}
                            </span>
                        </div>
                        <div className="history-item-actions">
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="history-link"
                                title="Open"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </a>
                            <button className="history-copy" onClick={() => copyUrl(item.url)} title="Copy link">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatTime(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
