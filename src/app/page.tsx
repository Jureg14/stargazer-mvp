'use client';
import { useState } from 'react';
import { format } from 'date-fns';

export default function Home() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getStargaze = async () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch('/api/stargaze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude, date: new Date().toISOString().split('T')[0] }),
      });
      setBlocks(await res.json());
      setLoading(false);
    });
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">🌌 Local Stargazer MVP</h1>
      <button onClick={getStargaze} disabled={loading} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500">
        {loading ? 'Calculating...' : 'Find Tonight\'s Windows'}
      </button>

      <div className="mt-6 space-y-3">
        {blocks.map((b, i) => (
          <div key={i} className="bg-gray-900 p-4 rounded border border-gray-800">
            <p className="font-mono text-sm">{format(b.start, 'HH:mm')} – {format(b.end, 'HH:mm')}</p>
            <p className="text-sm text-gray-400 mt-1">Objects: {b.objects.join(', ') || 'None'}</p>
            <p className="text-sm text-gray-400">Conditions: {b.conditions.join(', ') || 'None'}</p>
          </div>
        ))}
        {blocks.length === 0 && !loading && <p className="text-gray-500 mt-4">No optimal windows found tonight.</p>}
      </div>
    </main>
  );
}