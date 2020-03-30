const breakdown = (data) => {
  if(!data || data.length === 0) return null;
  
  const map = {}
  data.forEach(feature => {
    const location = feature.properties["countriesAndTerritories"];
    const cases = feature.properties["cases"];
    if (location !== null) {
      if (map[location]) {
        map[location] = map[location] + cases
      } else {
        map[location] = typeof cases === 'number' ? +(cases) : cases
      }
    }
  });
  return map;
}

export {
  breakdown
}