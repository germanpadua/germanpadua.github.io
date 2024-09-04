document.addEventListener('DOMContentLoaded', function() {
    // Get all elements that trigger modals
    var triggers = document.querySelectorAll('.modal-trigger');
    var closeModalButtons = document.querySelectorAll('.modal .delete, .modal .modal-card-foot .button');

    // Loop through triggers and add event listeners
    triggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            var targetModal = document.getElementById(this.getAttribute('data-target'));
            targetModal.classList.add('is-active');
        });
    });

    // Loop through close buttons and add event listeners
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            var modal = this.closest('.modal');
            modal.classList.remove('is-active');
        });
    });

    // Close modal when clicking outside the modal content
    document.addEventListener('click', function(e) {
        var modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('is-active');
            }
        });
    });

    // Close modal with 'Esc' key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var activeModal = document.querySelector('.modal.is-active');
            if (activeModal) {
                activeModal.classList.remove('is-active');
            }
        }
    });
});