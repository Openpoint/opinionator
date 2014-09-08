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
<div id='container'>
	<div ng-controller="editQuestion">
		<table class='questions'>
			<tr ng-repeat="question in questions">
				<td>{{question.text}}</td>
				<td class='click' ng-click='del(question.id)'>delete</td>
			</tr>
		</table>
		<button ng-click="modal2('del')">Delete This Stream</button>
	</div>
	<div ng-controller="addQuestion" class='content'>
		<form name='add_quest'>
			<div class='infield'><textarea name='textarea' id='textinput' ng-model='text' autofocus='true' ng-minlength='{{min}}' ng-maxlength='{{max}}'></textarea><label ng-hide="add_quest.textarea.$viewValue">Add in your own opinions!<br>You get a chance for this every now and then.</label></div>
			<div id='allowed'><span class='minallowed'>{{min}} characters minimum | </span><span class='maxallowed'>{{max-add_quest.textarea.$viewValue.length}} remaining</span></div>
			<button ng-click='send(text,1)' ng-disabled="add_quest.$invalid || !add_quest.textarea.$viewValue">Submit</button>
		</form>	
	</div>
</div>
</div>
<?php
}else{?>
<div>Access denied</div>
<?php
}?>
