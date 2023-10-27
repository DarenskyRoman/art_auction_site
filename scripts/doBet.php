<?php

	//массив ответа сервера
	$response = array();

	if (isset($_POST['auction_id'])) {

		session_start();

		require 'authorizationCheck.php';
		require 'connectDB.php';

		$auction_id = $_POST['auction_id'];
		$user_id = $_SESSION['user_id'];
		$bet = $_POST['bet'];
		$bet_time = date('Y-m-d H:i:s');

		$balance = $mysqli->query("SELECT balance FROM users WHERE user_id = $user_id LIMIT 1")->fetch_assoc()['balance'];

		if($balance < $bet){
			$response['error'] = "Insufficient funds";
		}
		else {
			$balance -= $bet;
			$mysqli->query("INSERT INTO bets (auction_id, user_id, bet, bet_time)
				VALUES ('$auction_id', '$user_id', '$bet', '$bet_time')");
			$bet_id = $mysqli->insert_id;
			$mysqli->query("UPDATE users SET balance = $balance WHERE user_id = $user_id");
			$mysqli->query("UPDATE auctions SET bet_id = $bet_id WHERE auction_id = $auction_id");
			$response['success'] = '1';	
		}

	}

	else {

		$response['error'] = "Error when placing a bet";

	}

	echo json_encode($response);

?>