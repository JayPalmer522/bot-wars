
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashScreen from "./screens/SplashScreen";
import CreateProfileScreen from "./screens/CreateProfileScreen";
import InstructionsScreen from "./screens/InstructionsScreen";
import NavigationScreen from "./screens/NavigationScreen";
import BotWorkshopScreen from "./screens/BotWorkshopScreen";
import ArmyWorkshopScreen from "./screens/ArmyWorkshopScreen";
import OrdersListWorkshopScreen from "./screens/OrdersListWorkshopScreen";
import TargetingMapWorkshopScreen from "./screens/TargetingMapWorkshopScreen";
import CombatScreen from "./screens/CombatScreen";
import ResultsScreen from "./screens/ResultsScreen";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/create-profile" element={<CreateProfileScreen />} />
        <Route path="/instructions" element={<InstructionsScreen />} />
        <Route path="/navigation" element={<NavigationScreen />} />
        <Route path="/bot" element={<BotWorkshopScreen />} />
        <Route path="/army" element={<ArmyWorkshopScreen />} />
        <Route path="/orders" element={<OrdersListWorkshopScreen />} />
        <Route path="/targeting" element={<TargetingMapWorkshopScreen />} />
        <Route path="/combat" element={<CombatScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

