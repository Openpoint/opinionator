<?php
$data = json_decode(file_get_contents("php://input"));
//$data->username='michaeladmin';
//$data->email='michael@piquant.ie';
//$data->password='Me1th0b0b';
$timeago=12; //how long ago to check for returning ip answered string in hours.

$conn_string = "host=localhost port=5432 dbname=polldev user=website password=WebsiteatPostgres";
$dbh = pg_connect($conn_string);
if (!$dbh) {
	die("Error in connection: " . pg_last_error());
}else{
	//echo('including');
	//include("install/install.php");
}
function escape($data_batch){
	foreach($data_batch as $key => $value){
		global ${'p_'.$key};
		if($key != 'answered'){			
			${'p_'.$key}=pg_escape_string($value);
		}else{
			${'p_'.$key}=$value;
		}
	}
}
?>
