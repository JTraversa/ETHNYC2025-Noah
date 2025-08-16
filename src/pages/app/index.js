import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";

export const App = () => {
  return (
    <HelmetProvider>
      <section id="app" className="app">
        <Helmet>
          <meta charSet="utf-8" />
          <title> App | {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="app_content">
                <div className="app_header">
                  <h1 className="display-4 mb-4">Noah App</h1>
                  <p className="lead">
                    Secure your cryptocurrency inheritance with our innovative dead man switch technology
                  </p>
                </div>
                
                <div className="row">
                  <div className="col-lg-8 mx-auto">
                    <div className="app_features">
                      <div className="feature_card mb-4">
                        <div className="card">
                          <div className="card-body">
                            <h3 className="card-title">🔐 Set Up Your Dead Man Switch</h3>
                            <p className="card-text">
                              Configure your cryptocurrency inheritance settings with multiple layers of security 
                              and real-world verification systems.
                            </p>
                            <button className="btn btn-primary">Get Started</button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="feature_card mb-4">
                        <div className="card">
                          <div className="card-body">
                            <h3 className="card-title">👥 Manage Beneficiaries</h3>
                            <p className="card-text">
                              Add and manage trusted beneficiaries who will receive access to your digital 
                              assets when the system is triggered.
                            </p>
                            <button className="btn btn-primary">Manage Beneficiaries</button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="feature_card mb-4">
                        <div className="card">
                          <div className="card-body">
                            <h3 className="card-title">📊 Monitor Your Assets</h3>
                            <p className="card-text">
                              Keep track of all connected wallets and assets that are protected under 
                              your Noah inheritance plan.
                            </p>
                            <button className="btn btn-primary">View Assets</button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="feature_card mb-4">
                        <div className="card">
                          <div className="card-body">
                            <h3 className="card-title">⚙️ Real-World Verification</h3>
                            <p className="card-text">
                              Configure how Noah connects to the real world through various verification 
                              methods including biometric, legal, and social confirmations.
                            </p>
                            <button className="btn btn-primary">Configure Verification</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="app_status">
                      <div className="status_card">
                        <h4>System Status</h4>
                        <div className="status_indicator">
                          <span className="status_dot active"></span>
                          <span>All systems operational</span>
                        </div>
                        <p className="status_text">
                          Your inheritance plan is active and monitoring. Last check-in: Today
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </HelmetProvider>
  );
};

