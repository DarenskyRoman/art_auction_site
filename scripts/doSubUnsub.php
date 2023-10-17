<?php
	
	//массив ответа сервера
	$response = array();

	//айди пользователя для подписки/отписки получено
	if (!empty($_POST['following_id'])) {

		session_start();

		require 'authorizationCheck.php';
		require 'connectDB.php';

		$following_id = $_POST['following_id'];
		$user_id = $_SESSION['user_id'];

		$subscribtion = $mysqli->query("SELECT * FROM subscribtions WHERE follower_id = '$user_id' and following_id = '$following_id' LIMIT 1")->fetch_assoc();

		//если не подписаны - подписываемся
		if (empty($subscribtion)) {

			$mysqli->query("INSERT INTO subscribtions (follower_id, following_id) VALUES ($user_id, $following_id)");

		}

		//если подписаны - отписываемся
		else {

			$mysqli->query("DELETE FROM subscribtions WHERE follower_id = '$user_id' and following_id = '$following_id'");

		}

		$response['success'] = '1';

	}

	//айди пользователя для подписки/отписки не было получено
	else {

		$response['error'] = "Error when following/unfollowing";

	}

	echo json_encode($response);

?>