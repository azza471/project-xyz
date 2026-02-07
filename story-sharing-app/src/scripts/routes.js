import Login from "./pages/login.js";
import Register from "./pages/register.js";
import Home from "./pages/home.js";
import Add from "./pages/add.js";
import DetailPage from "./pages/detail.js";
import Favorites from "./pages/favorites.js";

export default {
  "/login": Login,
  "/register": Register,
  "/home": Home,
  "/add": Add,
  "/detail/:id": DetailPage,
  "/favorites": Favorites,
};
