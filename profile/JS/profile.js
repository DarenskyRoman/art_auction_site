$(function () {

	let user_id = getParameterByName('id');

	$('.primary').on('click', function () {
		$.post('../../scripts/doSubUnsub.php', { following_id: user_id }, function (subscription) {
			sub = JSON.parse(subscription)
			console.log(sub.status);
			if (sub.status == 1) {
				$('.primary').toggleClass('activebtn');
			} else {
				alert("Не получилось подписаться =c");
			}
		});


	});


	const profileElements = {
		'about': $('#profile-desc'),
		'login': document.getElementById('profile-login'),
		'count_posts': document.getElementById('profile-posts'),
		'name': document.getElementById('name'),
		'surname': document.getElementById('surname'),
		'count_followers': document.getElementById('profile-followers'),
		'count_following': document.getElementById('profile-following'),
	}


	$.ajax({
		url: "../../scripts/getProfileInfo.php",
		type: "POST",
		data: { user_id: user_id },
		success: function (data) {
			let object = JSON.parse(data);
			let paintings = object.data;

			for (let key in profileElements) {
				if (profileElements.hasOwnProperty(key)) {
					let element = profileElements[key];
					element.textContent = paintings[key];
				}
			}
			$('#profile-picture').attr('src', paintings.profile_picture);

			if (paintings.is_follow == true) {
				$('.primary').addClass('activebtn');
			}
		},
		error: function (xhr) {
			console.log("Что ты написал!");
		}
	})


	// прогрузка постов
	const limit = 8;
	let offset = 0;
	let isLoading = false;

	// загрузил первую партию
	loadPosts();

	// загружаю посты по мере скролла
	$(window).scroll(function () {
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
			loadPosts(user_id);
		}
	})

// Переключение табов
	$('.tabs').on('click', '.tab-item', function () {
		$('.activetab').removeClass('activetab');
		$(this).addClass('activetab');
		if (($(this).find('span').text()) == 'POSTS') {
			offset = 0;
			return loadPosts();
		} else {
			$('.gallery').empty();
		};
	});

	// загружаю посты
	function loadPosts() {
		if (isLoading) return;
		isLoading = true;

		$.post('../../scripts/getUserDrewInfo.php', { offset: offset, limit: limit, user_id: user_id }, function (response) {
			response = JSON.parse(response);
			posts = response.data;

			generatePosts(posts);

			offset += limit;
			isLoading = false;

		}).fail(function (xhr, status, error) {
			console.log("Произошла ошибка при загрузке публикаций" + xhr + status + error);
			isLoading = false;
		})
	}


	// создаю посты
	function generatePosts(paintings) {

		$.each(paintings, function (i, post) {
			let item = $('<div>').addClass('gallery-item').attr('id', 'post=' + (i + 1));
			let image = $('<img>').attr('src', post.path_to_paint);

			item.append(image);
			$('.gallery').append(item);
		});
	}

	// получаю цифру id из вкладки
	function getParameterByName(name) {
		let url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}
});

