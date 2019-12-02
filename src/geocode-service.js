const makeService = function(algoliaSearchPlaces) {
  async function geocode(address) {
    const results = await algoliaSearchPlaces.search({
      query: address,
      language: "ru",
      countries: ["by"]
    });
    return results.hits;
  }

  return {
    geocode
  };
};

module.exports = makeService;
