<?php
include('set.php');
$cookie=json_decode($_COOKIE["auth"]);
if(isset($cookie->uid)){
	include('auth.php');
	$token=gettoken($cookie->uid);
	if($token == $cookie->authtoken){
		$authorised = true;
	}else{
		$authorised = false;
	}
}
if($data->method == 'validate' && $authorised){
	echo('valid');
}
if($data->method == 'addhash'){
	escape($data);
	global $p_text,$p_type,$dbh;
	$sql = "INSERT INTO hashtags (text,type) VALUES ('".$p_text."','".$p_type."') returning id";
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo('error');
	}else{
		$arr = pg_fetch_all($result);
		print_r($arr);
		pg_close($dbh);
	}
}
if($data->method == 'getanswered'){
	escape($data);
	global $p_ip,$dbh;
	$date=date("Y-m-d H:i:s",time()-($timeago*3600));
	$sql = "
	SELECT DISTINCT id as aid,NULL::INTEGER as qadded,NULL::TEXT as hashid FROM answers WHERE ip='".$p_ip."' AND time  >= '".$date."' 
	UNION SELECT 
	NULL::INTEGER as id, COUNT(questions.id) as qadded, hashtags.text as hash FROM questions
	JOIN hashtags ON questions.hashid = hashtags.id
	WHERE ip='".$p_ip."' AND time  >= '".$date."' GROUP BY hashtags.text";
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo($sql);
	}else{
		$arr = pg_fetch_all($result);
		echo json_encode($arr);		
		/*
		$ids;
		$i=0;
		forEach($arr as $id){
			$ids[$i]=$id['id'];
			$i++;
		}
		echo json_encode($ids);
		*/
		pg_close($dbh);
	}
}
if($data->method == 'hashcheck'){
	escape($data);
	global $p_text,$dbh,$p_id;
	if($p_text){
		$foo="WHERE text='".$p_text."'";
	}else{
		$foo="WHERE id=".$p_id;
	}
	$sql = "SELECT id,text,type FROM hashtags ".$foo;

	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo('error');
	}else{
		$arr = pg_fetch_all($result);
		echo json_encode($arr);
		pg_close($dbh);
	}
}
if($data->method == 'gethashid'){
	escape($data);
	global $dbh,$p_id;
	$sql = "SELECT hashid FROM questions WHERE id=".$p_id;

	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo($sql);
	}else{
		$arr = pg_fetch_all($result);
		echo json_encode($arr);
		pg_close($dbh);
	}
}
if($data->method == 'gethashid2'){
	escape($data);
	global $dbh,$p_text;
	$sql = "SELECT id FROM hashtags WHERE text='".$p_text."'";

	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo($sql);
	}else{
		$arr = pg_fetch_all($result);
		echo json_encode($arr);
		pg_close($dbh);
	}
}
if($data->method == 'gethash'){

	$sql="
	SELECT
	hashtags.text,hashtags.type,COUNT(DISTINCT questions.id) AS qcount,COUNT(answers.id) AS acount
	FROM
	hashtags
	LEFT JOIN questions ON questions.hashid = hashtags.id
	LEFT JOIN answers ON answers.id = questions.id
	GROUP BY
	hashtags.text,hashtags.type;
	";
	
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo($sql);
	}else{
		$arr = pg_fetch_all($result);
		echo json_encode($arr);		
		pg_close($dbh);
	}
}
if ($data->method == 'fetch'){
	escape($data);
	global $p_limit,$p_id,$p_answered,$p_hid,$p_admin;
	if($p_answered && !$p_admin){
		$except="WHERE id NOT IN (".implode(',',$p_answered).") AND";
	}else{
		$except="WHERE";
	}
	if(!$p_id){
		$sql = "SELECT * FROM questions ".$except." hashid=".$p_hid." order by (case official when true then 0 else 1 end),(case official when false then popularity else id*-1 end) DESC limit ".$p_limit;
	}else{
		if (!in_array($p_id, $p_answered)) {
			$sql = "SELECT * FROM (SELECT * FROM questions WHERE id=".$p_id." UNION SELECT * FROM questions) union_result ".$except." hashid=".$p_hid." order by (case id when ".$p_id." then 0 else 1 end), id asc limit ".$p_limit;
		}else{
			$return = "<a href='/'>Pick Another</a>";
			echo ('{"questions":[{"id":-1,"text":"You have already voted on that link.<br>'.$return.'"}]}');
			pg_close($dbh);
			die();
		}
	}
	$result = pg_query($dbh, $sql);
	if($result){
		$arr = pg_fetch_all($result);
		if($p_get_results != true){
			echo json_encode($arr);
		}else{
			$sql=null;
			foreach($arr as $item){
				$id = $id.",".$item['id'];
				$id= ltrim ($id,',');
			}
			$sql="SELECT id,yes,no,meh FROM ".$p_hash.".answers WHERE id in (".$id.")";
			$result = pg_query($dbh, $sql);
			$arr2 = pg_fetch_all($result);
			$return['questions']=$arr;
			$return['answers']=$arr2;
			echo json_encode($return);
			pg_close($dbh);
		}
	}else{
		pg_close($dbh);
		die("Error in SQL query: ".$sql);
	}
}
if ($data->method == 'send'){
	escape($data);
	global $p_text,$p_hid,$p_ip;
	$date=date("Y-m-d H:i:s",time());	
	$sql = "INSERT INTO questions (text, official, hashid, time, ip) VALUES('".$p_text."','".$p_official."',".$p_hid.",'".$date."','".$p_ip."') returning *";
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		die("Error in SQL query: " . pg_last_error());
	}else{
		$arr = pg_fetch_all($result);
		echo json_encode($arr);
		pg_close($dbh);
	}
}
if ($data->method == 'total'){
	escape($data);
	global $p_hid,$p_answered;

	$sql = "SELECT sum(case WHEN hashid=".$p_hid." then 1 end) AS total, sum(case WHEN hashid=".$p_hid." AND id IN (".implode(',',$p_answered).") then 1 end) AS answered  FROM questions";
	
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo ($sql);
		die("Error in SQL query: " . pg_last_error());
	}else{
		$arr = pg_fetch_all($result);
		echo json_encode($arr);
		pg_close($dbh);
	}
}
if ($data->method == 'del'){
	escape($data);
	global $p_id,$p_hash;
	$sql = "DELETE FROM questions WHERE id=".$p_id.";DELETE FROM answers WHERE id=".$p_id;
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo $sql;
		die("Error in SQL query: " . pg_last_error());
	}else{
		pg_close($dbh);
	}
}
if ($data->method == 'remove'){
	escape($data);
	global $p_id,$p_text;
	$sql = "
DELETE FROM questions 
WHERE questions.hashid IN (SELECT hashtags.id FROM hashtags WHERE hashtags.text='".$p_text."');
DELETE FROM answers 
WHERE answers.hashid IN (SELECT hashtags.id FROM hashtags WHERE hashtags.text='".$p_text."');
DELETE FROM hashtags WHERE hashtags.text='".$p_text."'
";
	
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo $sql;
		die("Error in SQL query: " . pg_last_error());
	}else{
		echo('deleted');
		pg_close($dbh);
	}
}
if ($data->method == 'setting'){
	escape($data);
	global $p_id,$p_key,$p_key2,$p_value;
	$sql = "UPDATE settings SET ".$p_key."='".$p_value."'";
	
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		echo $sql;
		die("Error in SQL query: " . pg_last_error());
	}else{
		echo('saved');
		pg_close($dbh);
	}
}


if ($data->method == 'answer'){
	escape($data);
	global $p_id,$p_yes,$p_no,$p_meh,$p_ip,$p_city,$p_country,$p_id;
	if(!$p_yes){
		$p_yes = 0;
	}
	if(!$p_meh){
		$p_meh = 0;
	}
	if(!$p_no){
		$p_no = 0;
	}
	$time=date("Y-m-d H:i:s");
	$sql = "INSERT INTO answers (id, yes, meh, no, ip, city, country, hashid,time) VALUES('".$p_id."','".$p_yes."','".$p_meh."','".$p_no."','".$p_ip."','".$p_city."','".$p_country."','".$p_hid."','".$time."')";
	$result = pg_query($dbh, $sql);
	if (!$result) {
		pg_close($dbh);
		die("Error in SQL query: " . pg_last_error());
	}else{
		echo 'success';		
		if($p_no || $p_yes){
			$sql="UPDATE questions SET popularity = popularity + 1 WHERE id =".$p_id;
		}else{
			$sql="UPDATE questions SET popularity = popularity - 1 WHERE id =".$p_id;
		}
		$result = pg_query($dbh, $sql);
		pg_close($dbh);
	}	
}

?>
