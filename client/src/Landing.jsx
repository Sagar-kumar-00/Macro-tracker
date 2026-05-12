function Landing({ onGetStarted }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#121212', 
      color: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '80px 20px 60px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
        <h1 style={{ 
          fontSize: 'clamp(32px, 8vw, 56px)', 
          fontWeight: 'bold', 
          margin: '0 0 25px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: '1.2'
        }}>
          Macro Tracker
        </h1>
        <p style={{ 
          fontSize: 'clamp(16px, 4vw, 20px)', 
          color: '#b0b0b0', 
          maxWidth: '650px', 
          margin: '0 auto 45px',
          lineHeight: '1.7',
          padding: '0 10px'
        }}>
          Built for Indian food with body weight-based macros
        </p>
        <button 
          onClick={onGetStarted}
          style={{ 
            padding: '18px 52px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          Start Tracking Free
        </button>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '18px' }}>
          No signup • Works offline • Privacy first
        </p>
      </div>

      {/* Key Features */}
      <div style={{ 
        backgroundColor: '#1e1e1e', 
        padding: '50px 20px',
        borderTop: '1px solid #333',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '25px'
          }}>
            {[
              {
                icon: '🇮🇳',
                title: 'Indian Foods',
                desc: '70+ foods including paneer, roti, dal, dosa, idli'
              },
              {
                icon: '🏋️',
                title: 'Body Weight Macros',
                desc: 'Protein & fat based on your actual body weight'
              },
              {
                icon: '🔄',
                title: 'Multi-API Fallback',
                desc: 'FatSecret → USDA → Local DB. Always works'
              },
              {
                icon: '📱',
                title: 'Works Offline',
                desc: 'Track without internet. Data stays on device'
              }
            ].map((feature, i) => (
              <div key={i} style={{ 
                backgroundColor: '#2d2d2d', 
                padding: '25px', 
                borderRadius: '10px',
                border: '1px solid #444',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                <div style={{ fontSize: '38px', marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#f5f5f5', fontWeight: '600' }}>{feature.title}</h3>
                <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '14px' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Features */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '50px 20px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '30px',
          textAlign: 'center'
        }}>
          {[
            { icon: '⚡', title: 'Smart Parser', desc: '"2 eggs" or "100g chicken"' },
            { icon: '📊', title: 'Visual Progress', desc: 'Track protein, fats, carbs' },
            { icon: '✏️', title: 'Edit Meals', desc: 'Modify or delete anytime' },
            { icon: '🎯', title: 'BMR Calculator', desc: 'Personalized calorie goals' }
          ].map((feature, i) => (
            <div key={i}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '16px', marginBottom: '6px', color: '#f5f5f5', fontWeight: '600' }}>{feature.title}</h3>
              <p style={{ color: '#888', fontSize: '13px' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ 
        maxWidth: '700px', 
        margin: '0 auto', 
        padding: '60px 20px 80px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(28px, 6vw, 38px)', 
          marginBottom: '18px',
          color: '#f5f5f5',
          lineHeight: '1.3'
        }}>
          Start Tracking Today
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: '#b0b0b0', 
          marginBottom: '35px',
          lineHeight: '1.6'
        }}>
          Accurate nutrition data • No subscription • Privacy focused
        </p>
        <button 
          onClick={onGetStarted}
          style={{ 
            padding: '18px 55px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          Get Started Free
        </button>
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid #333',
        padding: '25px 20px',
        textAlign: 'center',
        color: '#666',
        fontSize: '13px'
      }}>
        <p>Made with 💜 for the Indian fitness community</p>
        <p style={{ marginTop: '8px' }}>
          <a href="https://github.com/Sagar-kumar-00/Macro-tracker" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ color: '#667eea', textDecoration: 'none' }}>
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}

export default Landing
