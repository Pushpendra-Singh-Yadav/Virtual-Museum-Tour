document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');

    // Show or hide the scroll-to-top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    // Smooth scroll to the top of the page
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});





document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const museumCards = document.querySelectorAll('.museum-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            museumCards.forEach(card => {
                // Get the category from the data-attribute
                const cardCategory = card.getAttribute('data-category');

                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 500); // Wait for transition
                }
            });
        });
    });
});









document.addEventListener('DOMContentLoaded', () => {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');

    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const videoCard = thumbnail.closest('.video-card');
            const videoId = thumbnail.getAttribute('data-video-id');

            // Hide the thumbnail and play button
            thumbnail.style.display = 'none';

            // Create the iframe element
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1`);
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');

            // Append the iframe to the video card
            videoCard.insertBefore(iframe, videoCard.querySelector('h3'));
        });
    });
});