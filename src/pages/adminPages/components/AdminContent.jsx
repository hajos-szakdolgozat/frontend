import Users from "../views/Users";
 import Ads from "../views/Ads";
import Transactions from "../views/Transactions";
import Complaints from "../views/Complaints";
import Statistics from "../views/Statistics";

function AdminContent({ aktivNezet }) {
  switch (aktivNezet) {
    case "users":
      return <Users />;
    case "ads":
      return <Ads />;
    case "transactions":
      return <Transactions />;
    case "complaints":
      return <Complaints />;
    case "stats":
      return <Statistics />;
    default:
      return null;
  }
}

export default AdminContent;
