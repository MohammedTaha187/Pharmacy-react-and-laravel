import "./about.css";
import { Link } from "react-router-dom";

const About = () => {
  const reviews = [
    { id: 1, name: "Ahmed", text: "The best pharmacy with all the medicines I need.", rating: 4.5 },
    { id: 2, name: "Fatima", text: "Excellent service and great prices. Highly recommended!", rating: 4.5 },
    { id: 3, name: "Khalid", text: "Their medical products are genuine, and delivery is super fast.", rating: 4.5 },
    { id: 4, name: "Mona", text: "They have all the vitamins and supplements I need.", rating: 4.5 },
    { id: 5, name: "Youssef", text: "Easy ordering process and great availability of medicines.", rating: 4.5 },
    { id: 6, name: "Sara", text: "Excellent customer service and free medical consultations.", rating: 4.5 },
  ];

  return (
    <section className="about-reviews">
      {/* About Section */}
      <div className="about">
        <div className="row">
          <div className="box">
            <h3>Why Choose Us?</h3>
            <p>
              We provide high-quality medicines and healthcare products,
              ensuring safe and effective treatments.
            </p>
            <Link to="/contact" className="btn">
              Contact Us
            </Link>
          </div>

          <div className="box">
            <h3>What Do We Offer?</h3>
            <p>
              A wide range of medicines, medical supplies, skincare, and body
              care, along with expert health consultations.
            </p>
            <Link to="/Medications" className="btn">
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews">
        <h1 className="title">Customer Reviews</h1>
        <div className="box-container">
          {reviews.map((review) => (
            <div key={review.id} className="box">
              <p>{review.text}</p>
              <div className="stars">
                {"★".repeat(Math.floor(review.rating))}
                {review.rating % 1 !== 0 && "☆"}
              </div>
              <h3>{review.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
