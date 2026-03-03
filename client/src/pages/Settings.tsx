import { useState, useEffect } from "react";

export default function Settings() {
    const [userhash, setUserhash] = useState("");
    const [saved, setSaved] = useState(false);
    const [cleared, setCleared] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("catbox_userhash");
        if (stored) setUserhash(stored);
    }, []);

    const handleSave = () => {
        const hash = userhash.trim();
        if (hash) {
            localStorage.setItem("catbox_userhash", hash);
            setSaved(true);
            setCleared(false);
            setTimeout(() => setSaved(false), 3000);
        } else {
            localStorage.removeItem("catbox_userhash");
            setCleared(true);
            setSaved(false);
            setTimeout(() => setCleared(false), 3000);
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>Settings</h1>
                <p className="page-subtitle">
                    Configure your Catbox.moe account for upload management.
                </p>
            </div>

            <div className="settings-card glass-card">
                <div className="settings-section">
                    <div className="settings-label">
                        <h3>Userhash</h3>
                        <p>
                            Your catbox.moe userhash links uploads to your account. Find it on
                            your{" "}
                            <a
                                href="https://catbox.moe/user/manage.php"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                account page
                            </a>
                            .
                        </p>
                    </div>

                    <div className="settings-input-group">
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <input
                                id="userhash-input"
                                type="text"
                                placeholder="Enter your catbox userhash..."
                                value={userhash}
                                onChange={(e) => setUserhash(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                className="text-input"
                            />
                        </div>
                        <button className="save-btn" onClick={handleSave}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Save
                        </button>
                    </div>

                    {saved && (
                        <div className="toast toast-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Userhash saved successfully!
                        </div>
                    )}
                    {cleared && (
                        <div className="toast toast-warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                            Userhash cleared
                        </div>
                    )}
                </div>

                <div className="settings-section">
                    <div className="settings-label">
                        <h3>About</h3>
                        <p>
                            envs.sh is a modern file uploader that uses{" "}
                            <a href="https://catbox.moe" target="_blank" rel="noopener noreferrer">
                                catbox.moe
                            </a>{" "}
                            as the storage backend. Upload via URL or drag-and-drop, and your
                            upload history is stored locally in your browser.
                        </p>
                    </div>
                    <div className="about-badges">
                        <span className="badge">v2.0</span>
                        <span className="badge">TypeScript</span>
                        <span className="badge">React</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
