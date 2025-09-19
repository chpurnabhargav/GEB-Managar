import { SignedIn, SignedOut, UserButton, SignIn } from "@clerk/clerk-react";
import "./Login.css";

function LoginDashboard() {
  return (
    <div className="login-dashboard">
      {/* Animated background particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <SignedOut>
        <div className="login-container">
          {/* Left side - Animated showcase */}
          <div className="showcase-side">
            <div className="logo-container">
              <div className="logo">GEB Manager</div>
              <div className="subtitle">Your Complete Business Solution</div>
            </div>

            <div className="features-container">
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <div className="feature-title">Analytics</div>
                <div className="feature-desc">Real-time business insights and performance tracking</div>
              </div>
              <div className="feature-card">
                <span className="feature-icon">💰</span>
                <div className="feature-title">Financial</div>
                <div className="feature-desc">Complete financial management and reporting tools</div>
              </div>
              <div className="feature-card">
                <span className="feature-icon">👥</span>
                <div className="feature-title">Team</div>
                <div className="feature-desc">Collaborate with your team and manage projects</div>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🚀</span>
                <div className="feature-title">Growth</div>
                <div className="feature-desc">Scale your business with powerful automation</div>
              </div>
            </div>

            {/* Animated stats */}
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
          </div>

          {/* Right side - Clerk SignIn */}
          <div className="signin-side">
            <div className="signin-wrapper">
              <SignIn 
                redirectUrl="/dashboard" 
                appearance={{
                  elements: {
                    rootBox: "signin-root-custom",
                    card: "signin-card-custom"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="dashboard-content">
          <div className="welcome-header">
            <div className="logo-small">GEB Manager</div>
            <h2>Welcome to your dashboard!</h2>
            <p className="welcome-subtitle">Manage your business with powerful tools and insights</p>
          </div>
          
          <div className="dashboard-features">
            <div className="dashboard-card">
              <span className="dashboard-icon">📈</span>
              <h3>Analytics</h3>
              <p>View your performance metrics</p>
            </div>
            <div className="dashboard-card">
              <span className="dashboard-icon">💼</span>
              <h3>Projects</h3>
              <p>Manage ongoing projects</p>
            </div>
            <div className="dashboard-card">
              <span className="dashboard-icon">⚙️</span>
              <h3>Settings</h3>
              <p>Customize your experience</p>
            </div>
          </div>
          
          <div className="user-section">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-12 h-12",
                  userButtonPopoverCard: "shadow-2xl"
                }
              }}
            />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

export default LoginDashboard;