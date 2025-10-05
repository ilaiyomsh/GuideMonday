import React from 'react';

/**
 * תיבת דו-שיח לאישור יצירת לוח מדיה חדש
 * מוצגת כאשר לוח המדיה נמחק או לא נמצא
 */
export default function MediaBoardDialog({ 
  isOpen, 
  isChecking, 
  message, 
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div className="modal-content media-board-dialog" style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        direction: 'rtl'
      }}>
        <div className="modal-header" style={{
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '0.5rem'
          }}>
            ⚠️
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '1.5rem',
            color: '#333'
          }}>
            לוח מדיה
          </h3>
        </div>
        
        <div className="modal-body" style={{
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ 
            whiteSpace: 'pre-line',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            color: '#555',
            margin: 0
          }}>
            {message}
          </p>
        </div>
        
        <div className="modal-footer" style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button 
            onClick={onCancel}
            disabled={isChecking}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              color: '#666',
              cursor: isChecking ? 'not-allowed' : 'pointer',
              opacity: isChecking ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isChecking) {
                e.target.style.background = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            ביטול
          </button>
          <button 
            onClick={onConfirm}
            disabled={isChecking}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '4px',
              background: isChecking ? '#ccc' : '#0085ff',
              color: 'white',
              cursor: isChecking ? 'not-allowed' : 'pointer',
              opacity: isChecking ? 0.6 : 1,
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (!isChecking) {
                e.target.style.background = '#0073e6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isChecking) {
                e.target.style.background = '#0085ff';
              }
            }}
          >
            {isChecking ? 'יוצר לוח...' : 'צור לוח חדש'}
          </button>
        </div>
      </div>
    </div>
  );
}
