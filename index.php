<?php

?>
<!doctype html>
<html lang="en" ng-app="myApp">
<head>
	<link rel="icon" type="image/png" href="img/favicon.png">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
	<meta charset="utf-8">
	<title>The Opinionator</title>
	<script language="javascript" src="http://j.maxmind.com/app/geoip.js"></script>
	
	<link rel="stylesheet" href="css/reset.css"/>
	<link rel="stylesheet" href="css/app.css"/>
	<link rel="stylesheet" href="css/fluidmedia.css"/>
	<link rel="stylesheet" href="css/fonts/css/fontello.css"/>
</head>

<body>
	
	<div id='mainwrapper' ng-class='page'>
		<div id='maininner'>
			
			<div ng-controller="locate"><!--{{city}} - {{country}}--></div>
			<div id='viewport' ng-view='viewport'></div>
		</div>
	</div>

	<!-- In production use:
		<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
	-->  
	<script src="js/jquery-2.1.1.min.js"></script>
	<script src="angular.js"></script>
	<script src="angular-route.js"></script>
	<script src="angular-animate.min.js"></script>
	<script src="angular-cookies.min.js"></script>
	<script src="js/app.js"></script>
	<script src="js/services.js"></script>
	<script src="js/controllers.js"></script>
	<script src="js/filters.js"></script>
	<script src="js/directives.js"></script>
	
	<ul id='mainmenu' class="menu" ng-controller='menu'>
		<li><a href="#/home">Home</a></li>
		<li ng-show='authorised'><a href="/#/settings">Settings</a></li>
		<li ng-show='authorised && question'><a href="#/{{question}}/manage">Manage</a></li>
		<li ng-show='question'><a id='context' href="#/{{question}}/base"> {{type}}{{question}} </a></li>
		<li ng-show='question'><a href="#/{{question}}/stats">Results</a></li>
		<li><a href="#/about">About</a></li>
		<li ng-hide='authorised' ng-click='modal2("login")'><a>Admin</a></li>
		<li ng-show='authorised' ng-click='logout()'><a>Logout</a></li>
	</ul>
</body>
</html>
