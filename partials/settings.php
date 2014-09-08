<?php
$cookie=json_decode($_COOKIE["auth"]);
if(isset($cookie->uid)){
	include('../php/auth.php');
	$token=gettoken($cookie->uid);
	if($token == $cookie->authtoken){
		$authorised = true;
	}
}
?>
<div ng-controller='main'>
	<div id='modal' ng-controller="modalbox" class='check-element animate-show' ng-hide='modal'>
		<div class='wrapper' ng-click="modal2()">
			<div class='boxwrapper' ng-click='$event.stopPropagation()'><div id='close' ng-click='modal2()'>x</div><div id='m_box' ng-click='$event.stopPropagation()' ng-bind-html="inmodal" compile-template></div></div>
		</div>
	</div>

	<?php
	if($authorised){?>
	<div id='container' ng-controller='settings'>
		<form id='settings' name='settings'>
			<div class='smtp'>
				<div class='heading'>SMTP email settings</div>
				<label>URL<input type='text' ng-model='smtp_ip' ng-blur="submit(smtp_ip,'smtp_addr')"/></label><br>
				<label>User<input type='text' ng-model='smtp_user' /></label><br>
				<label>Password<input type='password' ng-model='smtp_password' /></label>
			</div>
			
		</form>
		{{smtp_ip}}
	</div>
</div>
<?php
}else{?>
<div>Access denied</div>
<?php
}?>
