import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import { Live } from "./components/Live";
import { Landing } from "./components/Landing";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/room" children={<Live />} />
          <Route exact path="/" children={<Landing />} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
