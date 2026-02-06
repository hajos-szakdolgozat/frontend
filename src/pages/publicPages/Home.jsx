import useAuthContext from "../../hooks/UseAuthContext";

const Home = () => {
  const { user } = useAuthContext();

  return <div>Szia {user?.name}!</div>;
};

export default Home;
