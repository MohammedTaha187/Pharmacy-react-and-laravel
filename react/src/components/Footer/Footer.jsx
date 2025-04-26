import { Link } from "react-router-dom";
import { faFacebook, faTwitter, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faAngleRight, faPhone, faEnvelope, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <footer className="footer bg-light py-5 mt-5 border-top">
      <div className="container">
        <div className="row">
          {/* Quick Links */}
          <div className="col-md-3">
            <h5 className="fw-bold text-primary">Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-dark text-decoration-none">
                  <FontAwesomeIcon icon={faAngleRight} className="me-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/medications" className="text-dark text-decoration-none">
                  <FontAwesomeIcon icon={faAngleRight} className="me-2" />
                  Medications
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-dark text-decoration-none">
                  <FontAwesomeIcon icon={faAngleRight} className="me-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-dark text-decoration-none">
                  <FontAwesomeIcon icon={faAngleRight} className="me-2" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="col-md-3">
            <h5 className="fw-bold text-primary">Account</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/cart" className="text-dark text-decoration-none">
                  <FontAwesomeIcon icon={faAngleRight} className="me-2" />
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-dark text-decoration-none">
                  <FontAwesomeIcon icon={faAngleRight} className="me-2" />
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-dark text-decoration-none">
                  <FontAwesomeIcon icon={faAngleRight} className="me-2" />
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-3">
            <h5 className="fw-bold text-primary">Contact Information</h5>
            <p className="text-dark">
              <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
              +1 234 567 890
            </p>
            <p className="text-dark">
              <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
              +1 987 654 321
            </p>
            <p className="text-dark">
              <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
              support@pharmacy.com
            </p>
            <p className="text-dark">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
              123 Pharmacy Street, New York, USA
            </p>
          </div>

          {/* Social Media */}
          <div className="col-md-3">
            <h5 className="fw-bold text-primary">Follow Us</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-dark fs-5">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className="text-dark fs-5">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="text-dark fs-5">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="text-dark fs-5">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4">
          <p className="text-muted">© 2025 MyPharmacy. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
