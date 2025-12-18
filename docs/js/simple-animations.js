/**
 * Simple Animations - Progress Bar
 */

(function ($) {
    'use strict';

    $(document).ready(function () {

        // Progress Bar Animation
        function updateProgressBar() {
            var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var scrolled = (winScroll / height) * 100;
            var progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = scrolled + '%';
            }
        }

        $(window).on('scroll', updateProgressBar);

        // Initial check on page load
        updateProgressBar();

    });

})(jQuery);
