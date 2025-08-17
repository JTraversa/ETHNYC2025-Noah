import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import {
  dataabout,
  meta
} from "../../content_option";

export const About = () => {
  // removed features and timeline

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
