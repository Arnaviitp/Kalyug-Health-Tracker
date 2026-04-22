import { useState } from 'react';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CommitmentMap = ({ data }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  // Compute month labels aligned strictly to grid columns
  // The grid has 52 columns. Each column represents a week. We look at the first day of each week (column).
  const monthLabels = [];
  let currentMonth = -1;

  for (let i = 0; i < data.length; i += 7) {
    const weekStart = data[i];
    if (weekStart && weekStart.date.getMonth() !== currentMonth) {
      currentMonth = weekStart.date.getMonth();
      monthLabels.push({ name: monthNames[currentMonth], colIndex: i / 7 });
    }
  }

  // Handle Day cell clicks
  const handleCellClick = (day) => {
    if (day.value > 0 && !day.isFuture) {
      setSelectedDay(day);
    }
  };

  return (
    <div className="heatmap-outer">
      
      <div className="heatmap-wrapper">
        <div className="heatmap-days-labels">
          <span style={{ gridRow: 2 }}>Mon</span>
          <span style={{ gridRow: 4 }}>Wed</span>
          <span style={{ gridRow: 6 }}>Fri</span>
        </div>

        <div className="heatmap-scroll-area">
          <div className="heatmap-scroll-inner">
            <div className="heatmap-months">
              {monthLabels.map((lbl, i) => (
                <span 
                  key={i} 
                  className="month-label" 
                  style={{ 
                    left: `${lbl.colIndex * 18}px` // 14px width + 4px gap = 18px per column
                  }}
                >
                  {lbl.name}
                </span>
              ))}
            </div>

            <div className="heatmap-grid" role="grid" aria-label="Commitment heat map">
              {data.map((day, idx) => {
                const dateStr = day.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                
                if (day.isFuture) {
                   return <div key={idx} className="heatmap-cell val-0" style={{ opacity: 0.1, cursor: 'default' }}></div>;
                }
                
                let habs = day.value === 0 
                            ? 'Zero habits documented' 
                            : `${day.value} daily habits completed`;
                            
                let tooltipStyle = {};
                const isFarLeft = idx < 35;
                const isFarRight = data.length - idx <= 35;
                const isTopRow = (idx % 7) < 3;
                
                if (isFarLeft) {
                  tooltipStyle.left = '0';
                  tooltipStyle.transform = 'translateX(4px)';
                } else if (isFarRight && data.length > 50) {
                  tooltipStyle.left = 'auto';
                  tooltipStyle.right = '0';
                  tooltipStyle.transform = 'translateX(-4px)';
                }

                if (isTopRow) {
                  tooltipStyle.bottom = 'auto';
                  tooltipStyle.top = '150%';
                }
                
                return (
                  <div 
                    key={idx} 
                    className={`heatmap-cell val-${day.value}`}
                    onClick={() => handleCellClick(day)}
                  >
                    <div className="tooltip" style={tooltipStyle}>
                      <strong>{dateStr}</strong><br/>
                      {habs}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '16px' }}>
        Less 
        <div className="heatmap-cell val-0"></div>
        <div className="heatmap-cell val-1"></div>
        <div className="heatmap-cell val-2"></div>
        <div className="heatmap-cell val-3"></div>
        <div className="heatmap-cell val-4"></div>
        More
      </div>

      {/* Historical Day Review Modal */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔥</div>
            <h2 className="modal-title">Temporal Log</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {selectedDay.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold' }}>
               {selectedDay.value} Actions Validated
            </div>
            <button className="modal-close-btn" style={{ marginTop: '24px'}} onClick={() => setSelectedDay(null)}>Resynchronize</button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default CommitmentMap;
