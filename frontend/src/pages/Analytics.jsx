import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/analytics')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div>Loading analytics...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Analytics Dashboard</h1>
      
      <div className="dashboard-sections" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem' }}>Weekly Overview</h3>
          </div>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weekly_data}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
