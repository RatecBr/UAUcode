import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { supabase } from '../AuthContext';

interface Target {
    id: number;
    name: string;
    target_url: string; // Changed to match snake_case DB or map it
    content_url: string;
    content_type: string;
}

import ManageUsers from './ManageUsers';

export default function AdminDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState<'targets' | 'users'>('targets');

    // ... (Keep existing fetchTargets, uploading logic, state)
    // IMPORTANT: I need to preserve the EXISTING logic for targets inside the 'targets' tab condition.
    // Since I'm replacing the whole component structure effectively, I will rewrite the return block to separate tabs.

    // ... (Re-declaring existing methods for context availability in replacement block)
    const [targets, setTargets] = useState<Target[]>([]);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [targetFile, setTargetFile] = useState<File | null>(null);
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [contentType, setContentType] = useState('video');
    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => { fetchTargets(); }, []);

    const fetchTargets = async () => {
        const { data, error } = await supabase.from('targets').select('*').order('id', { ascending: false });
        if (!error) setTargets(data || []);
    };

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId && (!targetFile || !contentFile)) { alert("Files required"); return; }
        setUploading(true);
        try {
            let tUrl = null, cUrl = null;
            if (targetFile) tUrl = await uploadFile(targetFile);
            if (contentFile) cUrl = await uploadFile(contentFile);

            const payload: any = { name, content_type: contentType };
            if (tUrl) payload.target_url = tUrl;
            if (cUrl) payload.content_url = cUrl;

            if (editId) {
                await supabase.from('targets').update(payload).eq('id', editId);
            } else {
                await supabase.from('targets').insert({
                    name, target_url: tUrl, content_url: cUrl, content_type: contentType
                });
            }
            alert('Saved!');
            resetForm();
            fetchTargets();
        } catch (e: any) { alert(e.message); }
        finally { setUploading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete?")) return;
        await supabase.from('targets').delete().eq('id', id);
        fetchTargets();
    };

    const startEdit = (t: Target) => {
        setEditId(t.id); setName(t.name); setTargetFile(null); setContentFile(null);
    };

    const resetForm = () => {
        setName(''); setEditId(null); setTargetFile(null); setContentFile(null);
    };

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ fontSize: '24px', color: 'var(--primary)', margin: 0 }}>ADMIN</h1>

                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => setTab('targets')}
                            className={tab === 'targets' ? 'btn-primary' : 'glass-card'}
                            style={{ padding: '5px 15px', border: 'none', cursor: 'pointer' }}
                        >
                            Experiences
                        </button>
                        <button
                            onClick={() => setTab('users')}
                            className={tab === 'users' ? 'btn-primary' : 'glass-card'}
                            style={{ padding: '5px 15px', border: 'none', cursor: 'pointer' }}
                        >
                            Users
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/scanner')} className="glass-card" style={{ padding: '8px 15px', cursor: 'pointer', color: 'white' }}>
                        Scanner
                    </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="glass-card" style={{ padding: '8px 15px', cursor: 'pointer', color: '#ff4444' }}>
                        <LogOut size={16} /> Data
                    </button>
                </div>
            </header>

            {tab === 'targets' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                    {/* Upload Card */}
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{editId ? 'Edit' : 'New'} Experience</span>
                            {editId && <button onClick={resetForm} style={{ fontSize: '12px', background: 'none', color: 'white', border: '1px solid white', padding: '2px 5px' }}>Cancel</button>}
                        </h3>
                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input className="glass-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                            <div><label style={{ fontSize: '10px' }}>TARGET</label><input type="file" className="glass-input" onChange={e => setTargetFile(e.target.files?.[0] || null)} /></div>
                            <div><label style={{ fontSize: '10px' }}>CONTENT</label><input type="file" className="glass-input" onChange={e => setContentFile(e.target.files?.[0] || null)} /></div>
                            <select className="glass-input" value={contentType} onChange={e => setContentType(e.target.value)}>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                                <option value="3d">3D Model</option>
                            </select>
                            <button className="btn-primary" disabled={uploading}>{uploading ? 'Saving...' : 'Save'}</button>
                        </form>
                    </div>

                    {/* List Card */}
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <h3>Active Experiences</h3>
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {targets.map(t => (
                                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img src={t.target_url} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <span>{t.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => startEdit(t)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Del</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <ManageUsers />
            )}
        </div>
    );
}
