$(document).on('click', ".errors a.close_errors", function(event) {
    event.preventDefault();
    $(event.target).closest(".errors").empty();
})