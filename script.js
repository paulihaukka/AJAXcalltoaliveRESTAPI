
// OMDb API key
const apiKey = "YOUR_API_KEY";

// HTML elements
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const movieResults = document.getElementById("movieResults");
const message = document.getElementById("message");

// Search for movies
searchButton.addEventListener("click", searchMovies);

// search by pressing Enter
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchMovies();
    }
});

// Search movies from the OMDb API
async function searchMovies() {
    const searchTerm = searchInput.value.trim();

    // Check that the search field is not empty
    if (searchTerm === "") {
        message.textContent = "Please enter a movie name.";
        movieResults.replaceChildren();
        return;
    }

    message.textContent = "Loading movies...";
    movieResults.replaceChildren();
    searchButton.disabled = true;

    try {
        // Create the API request URL
        const url = new URL("https://www.omdbapi.com/");
        url.search = new URLSearchParams({
            apikey: apiKey,
            s: searchTerm,
            type: "movie"
        });

        // Fetch movie search results
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("The API request failed.");
        }

        const data = await response.json();

        // Check if the API returned any movies
        if (data.Response === "False") {
            message.textContent = data.Error || "No movies found.";
            return;
        }

        message.textContent = `Found ${data.Search.length} movies.`;

        // Display the movies
        displayMovies(data.Search);

    } catch (error) {
        console.error("Movie search error:", error);
        message.textContent = "Could not load movies. Please try again.";
    } finally {
        searchButton.disabled = false;
    }
}

// Display movie cards
function displayMovies(movies) {
    movieResults.replaceChildren();

    movies.forEach(function (movie) {
        // movie card
        const card = document.createElement("article");
        card.className = "movie-card";

        // movie poster
        const poster = document.createElement("img");
        poster.alt = `Poster for ${movie.Title}`;

        if (movie.Poster && movie.Poster !== "N/A") {
            poster.src = movie.Poster;
        } else {
            poster.alt = "No poster available";
        }

        // movie title
        const title = document.createElement("h2");
        title.textContent = movie.Title;

        // release year
        const year = document.createElement("p");
        year.textContent = `Year: ${movie.Year}`;

        // More info button
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "More info";
        detailsButton.className = "details-button";

        // area for additional information
        const details = document.createElement("div");
        details.className = "movie-details";

        // event handler to the button
        detailsButton.addEventListener("click", function () {
            getMovieDetails(movie.imdbID, details, detailsButton);
        });

        // elements to the card
        card.append(poster, title, year, detailsButton, details);

        // card to the results section
        movieResults.appendChild(card);
    });
}

// Fetch additional information about one movie
async function getMovieDetails(imdbID, detailsContainer, button) {
    button.disabled = true;
    button.textContent = "Loading...";

    try {
        // Create a request using the movie's IMDb ID
        const url = new URL("https://www.omdbapi.com/");
        url.search = new URLSearchParams({
            apikey: apiKey,
            i: imdbID,
            plot: "full"
        });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("The API request failed.");
        }

        const data = await response.json();

        if (data.Response === "False") {
            throw new Error(data.Error || "Movie details could not be found.");
        }

        // Clear previous details
        detailsContainer.replaceChildren();

        // Display additional movie information
        addDetail(detailsContainer, "Genre", data.Genre);
        addDetail(detailsContainer, "Director", data.Director);
        addDetail(detailsContainer, "Actors", data.Actors);
        addDetail(detailsContainer, "Runtime", data.Runtime);
        addDetail(detailsContainer, "IMDb rating", data.imdbRating);
        addDetail(detailsContainer, "Plot", data.Plot);

        button.textContent = "Details loaded";

    } catch (error) {
        console.error("Movie details error:", error);
        detailsContainer.textContent = error.message;
        button.textContent = "Try again";
        button.disabled = false;
    }
}

// paragraph for movie details
function addDetail(container, label, value) {
    if (!value || value === "N/A") {
        return;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = `${label}: ${value}`;
    container.appendChild(paragraph);
}
