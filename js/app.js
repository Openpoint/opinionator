'use strict';

// Declare app level module which depends on filters, and services
var myApp=angular.module('myApp', [
	'ngRoute',
	'ngAnimate',
	'ngCookies',
	'poll'
]).
config(['$routeProvider', function($routeProvider) {
	//$routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'go_home',reloadOnSearch: false});
	$routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'go_home',reloadOnSearch: false});
	$routeProvider.when('/:prefix/manage', {templateUrl: 'partials/manage.php', controller: 'go_manage'});
	$routeProvider.when('/:prefix/stats', {templateUrl: 'partials/stats.html', controller: 'go_stats'});
	$routeProvider.when('/:prefix/base', {templateUrl: 'partials/vote.html', controller: 'go_prefix'});
	$routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'go_about'});
	$routeProvider.when('/settings', {templateUrl: 'partials/settings.php', controller: 'go_settings'});
	$routeProvider.otherwise({redirectTo: '/home'}); 
}]).run(function() {
	
	
});
var poll=angular.module('poll',[])

function resize(pclass){
	if(($('#viewport').html() && $('#mainwrapper').hasClass(pclass))||($('#viewport').html() && (!pclass))){
		//alert($('#mainwrapper').attr('class'));
		$('#hashadd .inner').width($('#hashcontainer').width()).css({'bottom':$('#mainmenu').outerHeight()-1});
	}else{
		setTimeout(function(){
			resize(pclass)
		},100)
	}	
}
$(document).ready(function(){
	resize()
});
$(window).resize(function(){
	resize();
})



