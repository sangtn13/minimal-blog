function isActiveRoute(route, currentRoute) {
  return route === currentRoute ? "active" : "";
}

export { isActiveRoute };