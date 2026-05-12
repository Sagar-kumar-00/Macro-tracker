function Landing({ onGetStarted }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0e1a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient Orbs Background */}
      <div style={{ 
        position: 'absolute', 
        top: '-10%', 
        right: '-5%', 
        width: '500px', 
        height: '500px', 
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'pulse 8s ease-in-out infinite'
      }}></div>
      <div style={{ 
        position: 'absolute', 
        bottom: '-10%', 
        left: '-5%', 
        width: '600px', 
        height: '600px', 
        background: 'radial-gradient(circle, rgba(72, 187, 120, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(70px)',
        animation: 'pulse 10s ease-in-out infinite 1s'
      }}></div>
      
      {/* Hero Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '80px 20px 60px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo/Brand */}
        <div style={{ 
          fontSize: '24px', 
          fontWeight: '700',
          color: '#f1f5f9',
          marginBottom: '80px',
          letterSpacing: '-0.5px',
          textAlign: 'center'
        }}>
          Macro Tracker
        </div>

        {/* Hero Content */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 20px',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '50px',
            marginBottom: '30px',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <span style={{ color: '#818cf8', fontSize: '14px', fontWeight: '600' }}>🇮🇳 Made for Indian Foods</span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(36px, 8vw, 72px)', 
            fontWeight: '800', 
            margin: '0 0 30px 0',
            color: '#ffffff',
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            animation: 'fadeInUp 0.6s ease-out 0.1s backwards'
          }}>
            Track nutrition
            <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              effortlessly
            </span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(17px, 3.5vw, 21px)', 
            color: '#94a3b8', 
            maxWidth: '600px', 
            margin: '0 auto 50px',
            lineHeight: '1.7',
            padding: '0 20px',
            animation: 'fadeInUp 0.6s ease-out 0.2s backwards'
          }}>
            Personalized macro goals based on your body. Track calories, protein, carbs, and fats with real-time insights.
          </p>
          
          <div style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}>
            <button 
              onClick={onGetStarted}
              style={{ 
                padding: '20px 50px', 
                fontSize: '18px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                border: 'none', 
                borderRadius: '16px', 
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.02)'
                e.target.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.15)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255,255,255,0.1)'
              }}
            >
              Start Tracking Free →
            </button>
            
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '20px', fontWeight: '500' }}>
              No signup • No credit card • Forever free
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>

      {/* Features Section */}
      <div style={{ 
        padding: '80px 20px 100px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: 'clamp(28px, 5vw, 42px)', 
            fontWeight: '800', 
            color: '#ffffff',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}>
            Everything you need
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: '#64748b', 
            marginBottom: '60px',
            fontSize: '18px'
          }}>
            Powerful features designed for simplicity
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '30px'
          }}>
            {[
              {
                icon: '🇮🇳',
                title: 'Indian Foods',
                desc: '70+ Indian foods including paneer, roti, dal, dosa, samosa, and more',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              },
              {
                icon: '⚖️',
                title: 'Smart Macros',
                desc: 'Personalized protein & fat goals calculated from your body weight',
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              },
              {
                icon: '📊',
                title: 'Visual Tracking',
                desc: 'Beautiful progress bars and real-time updates for your daily goals',
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                desc: 'Your data stays on your device. No servers, no tracking, no BS',
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
              }
            ].map((feature, i) => (
              <div key={i} style={{ 
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(10px)',
                padding: '40px 30px',
                borderRadius: '24px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                e.currentTarget.querySelector('.gradient-overlay').style.opacity = '0.15'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'
                e.currentTarget.querySelector('.gradient-overlay').style.opacity = '0'
              }}>
                <div 
                  className="gradient-overlay"
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: feature.gradient,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none'
                  }}
                ></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '56px', 
                    marginBottom: '20px',
                    display: 'inline-block',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '22px', 
                    marginBottom: '12px', 
                    color: '#f1f5f9', 
                    fontWeight: '700'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: '#94a3b8', 
                    lineHeight: '1.7', 
                    fontSize: '15px',
                    margin: 0
                  }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '14px',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{ marginBottom: '12px', fontSize: '15px' }}>Made with 💜 for the Indian fitness community</p>
        <p>
          <a href="https://github.com/Sagar-kumar-00/Macro-tracker" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ 
               color: '#818cf8', 
               textDecoration: 'none', 
               fontWeight: '600',
               transition: 'all 0.2s'
             }}
             onMouseEnter={(e) => {
               e.target.style.color = '#a5b4fc'
               e.target.style.textDecoration = 'underline'
             }}
             onMouseLeave={(e) => {
               e.target.style.color = '#818cf8'
               e.target.style.textDecoration = 'none'
             }}>
            View on GitHub →
          </a>
        </p>
      </div>
    </div>
  )
}

export default Landing
