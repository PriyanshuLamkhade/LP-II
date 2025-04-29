$(document).on("pageinit", "#mainPage", function () {
    // Smooth scroll to sections
    $(".scroll-link").on("click", function (e) {
      e.preventDefault();
      const target = $(this).attr("href");
      $("html, body").animate({
        scrollTop: $(target).offset().top - 60
      }, 600);
    });
  
    // Form submission logic
    $("#contactForm").submit(function (e) {
      e.preventDefault();
  
      const name = $("#name").val().trim();
      const email = $("#email").val().trim();
      const message = $("#message").val().trim();
  
      if (name && email && message) {
        $("#formResponse").text(`Thanks, ${name}! We'll be in touch.`).fadeIn();
      } else {
        $("#formResponse").text("Please fill out all fields.").css("color", "red").fadeIn();
      }
    });
  });
  