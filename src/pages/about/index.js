import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import {
  dataabout,
  meta
} from "../../content_option";

export const About = () => {
  const features = [
    {
      title: "🔐 Dead Man Switch Technology",
      description: "Our innovative dead man switch automatically activates when you're unable to perform regular check-ins, ensuring your assets are safely transferred to your beneficiaries."
    },
    {
      title: "🌍 Real-World Connectivity", 
      description: "Unlike other solutions, Noah bridges the digital and physical worlds through multiple verification methods including biometric, legal, and social confirmations."
    },
    {
      title: "🛡️ Multi-Layer Security",
      description: "Combines blockchain security with real-world verification systems to create the most robust inheritance protection available."
    },
    {
      title: "👨‍👩‍👧‍👦 Beneficiary Management",
      description: "Easy setup and management of trusted beneficiaries with customizable inheritance rules and asset distribution."
    },
    {
      title: "📊 Asset Monitoring",
      description: "Track all your connected cryptocurrency wallets and assets in one secure dashboard with real-time updates."
    },
    {
      title: "⚡ Automated Triggers",
      description: "Smart contracts automatically execute inheritance transfers based on predefined conditions and verification confirmations."
    }
  ];

  const timeline = [
    {
      phase: "Research & Development",
      description: "Extensive research into cryptocurrency inheritance challenges and development of dead man switch technology",
      status: "Completed"
    },
    {
      phase: "Smart Contract Development", 
      description: "Building secure, audited smart contracts for asset management and inheritance triggers",
      status: "In Progress"
    },
    {
      phase: "Real-World Integration",
      description: "Developing connections to legal, biometric, and social verification systems",
      status: "In Progress"
    },
    {
      phase: "Beta Testing",
      description: "Limited beta release with select users to test and refine the platform",
      status: "Upcoming"
    },
    {
      phase: "Public Launch",
      description: "Full public release of the Noah cryptocurrency inheritance platform",
      status: "Upcoming"
    }
  ];

  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> About | {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">{dataabout.title}</h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>
        
        <Row className="sec_sp">
          <Col lg="5">
            <h2 className="color_sec py-4">Our Mission</h2>
          </Col>
          <Col lg="7" className="d-flex align-items-center">
            <div>
              <p>{dataabout.aboutme1}</p>
              <p>{dataabout.aboutme2}</p>
            </div>
          </Col>
        </Row>

        <Row className="sec_sp">
          <Col lg="5">
            <h2 className="color_sec py-4">Key Features</h2>
          </Col>
          <Col lg="7">
            {features.map((feature, i) => (
              <div key={i} className="feature-item mb-4">
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </Col>
        </Row>

        <Row className="sec_sp">
          <Col lg="5">
            <h2 className="color_sec py-4">Development Timeline</h2>
          </Col>
          <Col lg="7">
            <div className="timeline">
              {timeline.map((item, i) => (
                <div key={i} className="timeline-item mb-4">
                  <div className="timeline-content">
                    <h4 className="timeline-phase">{item.phase}</h4>
                    <p className="timeline-description">{item.description}</p>
                    <span className={`timeline-status status-${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="sec_sp">
          <Col lg="5">
            <h2 className="color_sec py-4">The Problem</h2>
          </Col>
          <Col lg="7">
            <div>
              <p>
                Cryptocurrency ownership comes with a critical challenge: if something happens to you, 
                your digital assets could be lost forever. Traditional inheritance methods don't work 
                with decentralized assets, leaving families without access to potentially significant wealth.
              </p>
              <p>
                Existing solutions are either too complex for average users or lack the real-world 
                connectivity needed for reliable inheritance triggers. Noah solves this by creating 
                a bridge between the digital and physical worlds.
              </p>
            </div>
          </Col>
        </Row>

        <Row className="sec_sp">
          <Col lg="5">
            <h2 className="color_sec py-4">Our Solution</h2>
          </Col>
          <Col lg="7">
            <div>
              <p>
                Noah's dead man switch technology provides a secure, automated way to ensure your 
                cryptocurrency is safely inherited. By combining blockchain security with real-world 
                verification systems, we create a foolproof inheritance mechanism.
              </p>
              <p>
                Our platform monitors your activity and, when combined with real-world verification 
                triggers, can automatically transfer your assets to designated beneficiaries when 
                you're no longer able to manage them yourself.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </HelmetProvider>
  );
};
