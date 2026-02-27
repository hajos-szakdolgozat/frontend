import Boats from "../../components/Favorites";

const FavoritesPage = () => {
  return (
    <section className="favorites-page">
      <header className="favorites-page__header">
        <div>
          <h2>Kedvenceim</h2>
        </div>
      </header>

      <Boats />
    </section>
  );
};

export default FavoritesPage;
