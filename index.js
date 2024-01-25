document.addEventListener("DOMContentLoaded", () => {
    const filmList = document.getElementById("films");
    const movieDetails = document.getElementById("movie-details");
    let data;

    const fetchFilms = () => {
        fetch("http://localhost:3000/films")
            .then(response => response.json())
            .then(apiData => {
                data = apiData;

                filmList.innerHTML = '';

                data.forEach((movie, index) => {
                    const movieItem = document.createElement("li");
                    movieItem.classList.add(`film-item${movie.id}`);
                    movieItem.textContent = movie.title;

                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.classList.add('delete-button');
                    deleteButton.addEventListener("click", () => deleteMovie(movie.id));
                    movieItem.appendChild(deleteButton);

                    movieItem.addEventListener("click", () => showMovieDetails(movie));
                    filmList.appendChild(movieItem);

                    if (index === 0) {
                        movieItem.click();
                    }
                });
            });
    };

    const deleteMovie = (movieId) => {
        fetch(`http://localhost:3000/films/${movieId}`, {
            method: 'DELETE'
        })
        .then(() => fetchFilms());
    };

    const showMovieDetails = (movie) => {
        movieDetails.innerHTML = "";

        const detailsContainer = document.createElement("div");
        detailsContainer.classList.add("inner-details");
        const availableTickets = movie.capacity - movie.tickets_sold;
        detailsContainer.innerHTML = `<img src="${movie.poster}" alt="${movie.title}">
                                    <p>Title: ${movie.title}</p>
                                    <p>Description: <span id=movie-description>${movie.description}</span></p>
                                    <p>Runtime: ${movie.runtime}</p>
                                    <p>Showtime: ${movie.showtime}</p>
                                    <p>Available tickets: <span id="ticket-count-${movie.id}">${availableTickets}</span></p>
                                    <button class="buy-ticket-button"><span id="data-movie-${movie.id}">Buy ticket</span></button>`;
        movieDetails.appendChild(detailsContainer);

        const ticketButton = detailsContainer.querySelector(".buy-ticket-button");
        const filmItem = document.querySelector(`.film-item${movie.id}`)
        if (ticketButton) {
            if(availableTickets===0){
                ticketButton.classList.add('sold-out');
                ticketButton.textContent = 'sold-out'
                filmItem.classList.add('sold-out');
            }
            ticketButton.addEventListener("click", () => {buyTicket(movie.id)});
        }
    };

    const buyTicket = (movieId) => {
        const selectedMovie = data.find(movie => movie.id === movieId);
        let availableTickets = selectedMovie.capacity - selectedMovie.tickets_sold;
        const ticketElement = document.getElementById(`ticket-count-${movieId}`);

        if (selectedMovie) {
            if (availableTickets < 1) {
                availableTickets = 0;
            } else {
                selectedMovie.tickets_sold += 1;
                availableTickets = selectedMovie.capacity - selectedMovie.tickets_sold;

                fetch(`http://localhost:3000/films/${movieId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tickets_sold: selectedMovie.tickets_sold,
                    }),
                })
                .then(() => {
                    fetch(`http://localhost:3000/films/${movieId}`)
                        .then(response => response.json())
                        .then(updatedMovie => {
                            showMovieDetails(updatedMovie);
                        });
                });
            }

            if (availableTickets <= 0) {
                availableTickets = 0;

                const filmItem = document.querySelector(`.film-item${movieId}`);
                if (filmItem) {
                    filmItem.classList.add('sold-out');
                }

                const buyButton = document.getElementById(`data-movie-${movieId}`);
                if (buyButton) {
                    buyButton.textContent = 'sold-out';
                    buyButton.classList.add('sold-out');
                }
            }

            if (ticketElement) {
                ticketElement.textContent = availableTickets;
            }
        }
    };

    fetchFilms();
});