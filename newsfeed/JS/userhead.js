$(function() {
	// прогрузка баланса и аватарки
		$.post('../../scripts/getUserHeadInfo.php', {}, function(data){
			result = JSON.parse(data);
			stats = result.data;
			if (result.success == 1){
				$('#balance').text(stats.balance);
				$('.profile-pic').attr('src', stats.profile_picture);
			}
			else {
				alert("Ты как сюда попал?");
				window.location.href = '../../main/main.html';
			}
		});

});