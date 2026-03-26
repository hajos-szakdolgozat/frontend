import Reservations from "../../components/IncomingReservations";
import Boats from "../../components/IncomingReservations";

const IncomingReservationsPage = () => {
  return (
    <section className="reserved-page">
      <header className="reserved-page__header">
        <div>
          <h2>Beérkező foglalásaid</h2>
        </div>
      </header>

      <Reservations />
    </section>
  );
};

export default IncomingReservationsPage;
