$(function () {
	$('.navigation').on('click', '.log-button', function () {
		$.post('../scripts/authorizationmain.php', {}, function(response){
			console.log(response);
			if (response.status != -1) {
				window.location.href = "../newsfeed/HTML/news.html";
			} else {
				window.location.href = "../authorization/Authorization.html";
			}
		})
	});
});