import bannerEvento1 from "../../assets/banner-1.png";
import bannerEvento2 from "../../assets/banner-2.png";
import bannerEvento3 from "../../assets/banner-3.png";

import "./Carrossel.css";

function Carrossel() {
  return (
    <section
      id="carrosselEventoPlus"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="10000"
    >
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src={bannerEvento1} className="carousel-banner" alt="banner do primeiro evento" />
        </div>
        <div className="carousel-item">
          <img src={bannerEvento2} className="carousel-banner" alt="banner do segundo evento" />
        </div>
        <div className="carousel-item">
          <img src={bannerEvento3} className="carousel-banner" alt="banner do terceiro evento" />
        </div>
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#carrosselEventoPlus" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true" />
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#carrosselEventoPlus" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true" />
      </button>
    </section>
  );
}

export default Carrossel;
