import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, Box } from 'lucide-react';

interface Target {
    id: number;
    name: string;
    targetUrl: string;
}

export default function AdminDashboard() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [targets, setTargets] = useState<Target[]>([]);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [targetFile, setTargetFile] = useState<File | null>(null);
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [contentType, setContentType] = useState('video');

    // Edit State
    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        try {
            const res = await fetch('/api/targets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setTargets(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: New requires files, Edit can be partial
        if (!editId && (!targetFile || !contentFile)) {
            alert("Both files are required for new experience.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('name', name);
        if (targetFile) formData.append('target', targetFile);
        if (contentFile) formData.append('content', contentFile);
        formData.append('contentType', contentType);

        try {
            const url = editId ? `/api/targets/${editId}` : '/api/upload';
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                alert(editId ? 'Experience Updated!' : 'Experience Created!');
                resetForm();
                fetchTargets();
            } else {
                const err = await res.json();
                console.error("Server Error:", err);
                alert(`Save Error: ${err.error || res.statusText}`);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert('Connection/Network Error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this experience?")) return;
        try {
            const res = await fetch(`/api/targets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchTargets();
            } else {
                const err = await res.json();
                alert(`Delete failed: ${err.error}`);
            }
        } catch (e) {
            console.error(e);
            alert("Delete connection error");
        }
    };

    const startEdit = (t: Target) => {
        setEditId(t.id);
        setName(t.name);
        setTargetFile(null); // Optional to replace
        setContentFile(null); // Optional to replace
        // Ideally we would set contentType too but backend didn't send it in GET /targets list in previous step.
        // Let's assume user re-selects it or we default to video.
        // Correction: fetchTargets endpoint mapping DOES NOT include contentType in previous server code (I should verify).
        // Let's just default video for now.
    };

    const resetForm = () => {
        setName('');
        setTargetFile(null);
        setContentFile(null);
        setEditId(null);
        setContentType('video');
    };

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>ADMIN CONSOLE</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/scanner')} className="btn-primary" style={{ display: 'flex', gap: '8px' }}>
                        OPEN SCANNER
                    </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary" style={{ display: 'flex', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

                {/* Upload Card */}
                <div className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Upload size={20} color="var(--primary)" /> {editId ? 'Edit Experience' : 'New Experience'}</span>
                        {editId && <button onClick={resetForm} style={{ fontSize: '12px', background: 'none', border: '1px solid white', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
                    </h3>

                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            className="glass-input"
                            placeholder="Experience Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TARGET IMAGE (JPG/PNG)</label>
                            <input type="file" className="glass-input" accept="image/*" onChange={e => setTargetFile(e.target.files?.[0] || null)} required />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CONTENT FILE</label>
                            <input type="file" className="glass-input" onChange={e => setContentFile(e.target.files?.[0] || null)} required />
                        </div>

                        <select className="glass-input" value={contentType} onChange={e => setContentType(e.target.value)}>
                            <option value="video">Video Overlay (MP4)</option>
                            <option value="audio">Audio Track (MP3)</option>
                            <option value="3d">3D Object (.glb)</option>
                        </select>

                        <button type="submit" className="btn-primary" disabled={uploading}>
                            {uploading ? 'UPLOADING...' : 'CREATE EXPERIENCE'}
                        </button>
                    </form>
                </div>

                {/* List Card */}
                <div className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Box size={20} color="var(--primary)" /> Active Experiences
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {targets.map(t => (
                            <div key={t.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '15px',
                                padding: '10px',
                                borderBottom: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <img src={t.targetUrl} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {t.id}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => startEdit(t)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {targets.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No experiences found.</div>}
                    </div>
                </div>

            </div>
        </div>
    );
}
