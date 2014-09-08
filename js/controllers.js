'use strict';

/* Controllers */
myApp.controller('go_home', ['$rootScope','$location',function($rootScope,$location) {
	$rootScope.page = $location.path().split("/");
	$rootScope.page_query = $location.search();
	resize('home');
}])

myApp.controller('go_manage', ['$rootScope','$location','fetchQuest','innit',function($rootScope,$location,fetchQuest,innit) {
	$rootScope.page = $location.path().split("/");
	innit.always();
	var form = document.getElementById('textinput');
	$rootScope.page_query = $location.search();
	if(form){
		form.focus();
	};
}])
myApp.controller('go_stats', ['$rootScope','$location','innit',function($rootScope,$location,innit) {
	$rootScope.page = $location.path().split("/");
	$rootScope.page_query = $location.search();
	innit.always();
}])
myApp.controller('go_prefix', ['$rootScope','$location','innit',function($rootScope,$location,innit) {
	$rootScope.page = $location.path().split("/");
	$rootScope.page_query = $location.search();	
}])
myApp.controller('go_about', ['$rootScope','$location',function($rootScope,$location) {
	$rootScope.page = $location.path().split("/");
}])
myApp.controller('go_settings', ['$rootScope','$location',function($rootScope,$location) {
	$rootScope.page = $location.path().split("/");
}])
myApp.controller('locate', ['$scope','$rootScope','$http','$cookieStore','fetchQuest','$routeParams',function($scope,$rootScope,$http,$cookieStore,fetchQuest,$routeParams) {
	if(typeof $rootScope.glob == 'undefined'){
		$rootScope.glob={};
	}
	$http.post('../php/ip.php').success(function(data){
			
		$rootScope.glob.ip=data;
		//get the clients ip
		fetchQuest.answered($routeParams.prefix);
	})
	//$rootScope.glob.city = geoip_city();
	//$rootScope.glob.country = geoip_country_name();
	if(!$rootScope.glob.city){
		$rootScope.glob.city='unknown';
	}
	if(!$rootScope.glob.country){
		$rootScope.glob.country='unknown';
	}
	$scope.city=$rootScope.glob.city;
	$scope.country=$rootScope.glob.country;	
}]);
poll.controller('menu', ['$scope','$rootScope','modal','$cookieStore',function($scope,$rootScope,modal,$cookieStore) {
	$rootScope.$watch('glob.authorised',function(){
		$scope.authorised=$rootScope.glob.authorised;
	});
	$rootScope.$watch('glob.type',function(){
		$scope.type=$rootScope.glob.type;
	})
	$rootScope.$watch('glob.question',function(){
		$scope.question=$rootScope.glob.question;
	})
	$scope.modal2 = function(x){
		modal.toggle(x);
	}
	$scope.logout=function(){
		$cookieStore.remove('auth');
		location.reload(); 
	}

}])
poll.controller('settings', ['$scope','$rootScope','$cookieStore','$http',function($scope,$rootScope,$cookieStore,$http) {
	$scope.submit=function(value,x,y){
		if(value){
			$http.post('../php/connect.php', {'method':'setting','value':value,'key':x,'key2':y}).success(function(data) {
				console.log(data);
			})
		}
	}
}])
poll.controller('main',['$scope','$rootScope','$sce','$cookieStore','$location','modal','innit','$routeParams','fetchQuest',function($scope,$rootScope,$sce,$cookieStore,$location,modal,innit,$routeParams,fetchQuest){
	
	//set the rootScope variables on load
	innit.always($routeParams.prefix);
	var slogans=["Keeping politicians honest", "Feeding the Llamas", "Keeping it real","Saying it as it is", "Fabricating truth"];
	var key = Math.floor(Math.random()*(slogans.length)); 
	$scope.slogan=slogans[key];
	$scope.question=$rootScope.glob.question;
		
	$rootScope.glob.modal = true;
	$scope.modal = $rootScope.glob.modal;
	if(!$rootScope.page_query){
		$rootScope.page_query={};
	};
	$rootScope.$watch('glob.type',function(){
		$scope.type=$rootScope.glob.type;
	})
	$rootScope.$watch('glob.tw_type',function(){
		$scope.tw_type=$rootScope.glob.tw_type;
	})
	$rootScope.$watch('page_query',function(){
		if($rootScope.page_query.id){
			var id=$rootScope.page_query.id;
			fetchQuest.gethashid(id).then(function(data){		
				fetchQuest.hashcheck(null,data[0].hashid).then(function(data2){				
					window.location='/#/'+data2[0].text+'/base?hid='+id;
					return;				
				})
			});			
		}
	});
	$rootScope.$watch('glob.question',function(){
		$scope.question=$rootScope.glob.question;
	});
	$rootScope.$watch('glob.authorised',function(){
		$scope.authorised=$rootScope.glob.authorised;
	});
	$rootScope.$watch('glob.modal',function(){
		$scope.modal = $rootScope.glob.modal;		
	})
	$rootScope.$watch('glob.message.active',function(){
		$scope.inmodal=$sce.trustAsHtml($rootScope.glob.message.active);					
	})
	$scope.modal2 = function(x){
		modal.toggle(x);
	}
	$scope.login2 = function(user,password){
		modal.login(user,password).then(function(data){		
				if(data == 'logged in'){
					modal.toggle();
					$rootScope.glob.authorised=true;
					location.reload(); 
				}else{
					$rootScope.glob.message.active=$rootScope.glob.message.link+'<div class="error">Incorrect login details</div>';
				}
		});
		return null;
	}


}]);
/* Controller for modals */
poll.controller('modalbox',['$scope','email','$rootScope','modal',function($scope,email,$rootScope,modal){
$rootScope.$watch('glob.message.active',function(){
	setTimeout(function(){
		if($('#username').val() && $('#userpass').val()){
			$scope.user=$('#username').val();
			$scope.password=$('#userpass').val();
		}
		$scope.$apply()
		
	},100)
});
	$scope.mail = function(recipient,sender,sender_add,umessage){
		$scope.recipient=null;
		email.send(recipient,sender,sender_add,umessage,$rootScope.glob.message.mail,$rootScope.glob.message.plain,$rootScope.glob.question).then(function(data){
			$rootScope.glob.message.active=data;
		});
	}
	$scope.lsender=false;
	$scope.toggle = function(x){
		$scope.lsender = $scope.lsender === false ? true: false;
	}
	$scope.adelete = function(){
		modal.remove($rootScope.glob.question).then(function(data){
			if (data=='deleted'){
				window.location='/#/';
			}
		});
	}
	
}]);

/* Controller for the add question form */
poll.controller('addQuestion',['$scope','fetchQuest','$rootScope','vote','$cookieStore','$location',function($scope, fetchQuest,$rootScope,vote,$cookieStore,$location){
	$scope.min=20;
	$scope.max=60;
	$scope.active=false;
	
	if($rootScope.glob.cookie[$rootScope.glob.question].addlimit){
		$scope.remaining=$rootScope.glob.cookie[$rootScope.glob.question].addlimit;
	}else{
		//$rootScope.glob.cookie[$rootScope.glob.question].addlimit=$rootScope.glob.qlimit;
		//$scope.remaining=$rootScope.glob.qlimit;
	}

	$rootScope.glob.notice={};

	$rootScope.$watch('glob.notice.text',function(){
		$scope.active=true;
		$scope.notice=$rootScope.glob.notice.text;
	})
	$rootScope.$watch('glob.notice.show',function(){
		$scope.active=$rootScope.glob.notice.show;
	})
	$rootScope.$watch('glob.change',function(){
		if(typeof $rootScope.glob.created != 'undefined'){

			if($rootScope.glob.created[$rootScope.glob.question] != null) {
			$scope.remaining=$rootScope.glob.qlimit-$rootScope.glob.created[$rootScope.glob.question];
			if($scope.remaining <=0){
				$location.search('firstrun',null);
				$scope.hidden_aq=true;
			}
		}else{
			$scope.remaining=$rootScope.glob.qlimit;
		}
			
		}
	});	
	$scope.send = function(x,y){
		fetchQuest.add(x,y,$scope);
	}
}]);


/* Controller for the management page */
poll.controller('editQuestion',['$rootScope','$scope','fetchQuest','$http',function($rootScope, $scope, fetchQuest,$http){

	$http.post('../php/connect.php', {'method':'gethashid2','text':$rootScope.glob.question}).success(function(data) {
		$rootScope.glob.hid=data[0].id;	
		//batch(limit) for sql query
		fetchQuest.batch('ALL',false,$scope,null,true).then(function(data) {
			$scope.questions=data;
			$rootScope.glob[$rootScope.glob.question].questions = data;
			$scope.total=$rootScope.glob[$rootScope.glob.question].questions.length;
		})
		var foo = 'glob.'+$rootScope.glob.question+'.questions';
		$rootScope.$watch(foo,function(){
			if($rootScope.glob[$rootScope.glob.question]){		
				$scope.questions = $rootScope.glob[$rootScope.glob.question].questions;
			}
		})
		$scope.del = function(x){
		   fetchQuest.del(x);    
		}
	});	
}]);

/* Controller for the question pages */
poll.controller('Question',['$location','$rootScope','$scope','$route','$sce','$timeout','$cookieStore','fetchQuest','vote','stats','modal','$routeParams',function($location, $rootScope, $scope, $route, $sce, $timeout, $cookieStore, fetchQuest, vote,stats,modal,$routeParams){
	//$rootScope.page_query = $location.search();
	$scope.question=$rootScope.glob.question;
	$scope.hidden_q=true;
	$scope.hidden_aq=true;
	$rootScope.$watch('glob.question',function(){
		$scope.question=$rootScope.glob.question;
	});	

	$rootScope.glob.message={};
	$rootScope.$watch('glob.type',function(){
		$scope.type=$rootScope.glob.type;
	})
	$rootScope.$watch('glob.tw_type',function(){
		$scope.tw_type=$rootScope.glob.tw_type;
	})
	if($rootScope.glob.user_position != 1){
		//The initial increment for offset of batch and add a question
		$scope.limit=2;
		$scope.count=0;
	}else{
		if($rootScope.glob.cookie[$rootScope.glob.question].limit){
			$scope.limit=$rootScope.glob.cookie[$rootScope.glob.question].limit;
		}else{
			$scope.limit=2;
		}
		$scope.count=$rootScope.glob.cookie[$rootScope.glob.question].count;
	}
	$scope.active1=null;
	$scope.active2=null;
	$scope.active3=null;
	$scope.item={};
	$scope.item.yes = false;
	$scope.item.no = false;
	$scope.item.meh = false;
	$scope.h1_hide=true;

	$scope.results = {};

	$scope.oldquest = $rootScope.glob[$rootScope.glob.question].oldquest;
	$scope.tweet=$scope.oldquest.tweet;
	$scope.url=$scope.oldquest.e_url;
	$scope.hashtag=$rootScope.glob.question;
	
/*
	$rootScope.$watch('glob.'+$rootScope.glob.question+'.oldquest.e_url',function(){
		$scope.url=$rootScope.glob[$rootScope.glob.question].oldquest.e_url;
	})
	*/
	$rootScope.$watch('glob.alldone',function(){
		$scope.alldone=$rootScope.glob.alldone;
	})

	$scope.modal = function(x,oldquest){
		modal.toggle(x,oldquest);
	}
	
	$scope.fetched = function(){
		$scope.query = $location.search();
		if($scope.query.hid){
			var id = $scope.query.hid;
		}else{
			var id = null;
		}
		fetchQuest.hashcheck($rootScope.page[1]).then(function(data){
			$rootScope.glob.type=data[0].type;
			if(data[0].type=='#'){
				$rootScope.glob.tw_type='%23';
			}else{
				$rootScope.glob.tw_type=data[0].type;
			}
			fetchQuest.batch($scope.limit,true,$scope,id).then(function(data) {
				
				if(data.questions[0]){
					$scope.questions = data.questions;
					if(!$scope.questions[$scope.count]){
						$scope.count=0;
					}
					$scope.thisquest=$sce.trustAsHtml($scope.questions[$scope.count].text);
					if($scope.questions[$scope.count].id == -1){
						$rootScope.glob.alldone=true;
					}
					$scope.total=$scope.questions.length;
					$scope.stats = data.answers;
					stats.sort($scope,$scope.stats);
					$location.search('id',null);
				}else{
					if($rootScope.page_query.firstrun == 'true'){
						$scope.thisquest=$sce.trustAsHtml('<div class="end"><h1>Add some opinions</h1><div class="small"2>Great, you have started a stream. Add your opinions and share.</div>');
						$scope.hidden_aq=false;
					}else{
						$scope.thisquest=$sce.trustAsHtml('<div class="end"><h1>All Done</h1><div><a href="/#/'+$rootScope.glob.question+'/stats">See the results</a></div></div>');
						$scope.hidden_aq=false;
					}
				}
				
			});
		});
		
	}
	$scope.fetched();
	
		
	//submit a vote		
	$scope.changer = function(id,value){
		vote.change(id,value,$scope.item,$scope);
		vote.timer($scope);
	}
	//present a new question added as the next to answer
	$rootScope.$watch('glob.newquestion',function(){
		if($rootScope.glob.newquestion && $scope.questions){
			$scope.questions.splice($scope.count+1, 0, $rootScope.glob.newquestion);
			$scope.total=$scope.questions.length;
		}else if($rootScope.glob.newquestion){
			$scope.questions={};
			$scope.questions[0]=$rootScope.glob.newquestion;
			window.location.reload()
		}
	})	
}]);

/* Controller for the results page */
poll.controller('data',['$rootScope','$scope','$location','getStats','modal','fetchQuest',function($rootScope, $scope, $location, getStats,modal,fetchQuest){
	$scope.Math = window.Math;
	$scope.orderByField = 'question';
	$scope.reverseSort = false;
	
	$rootScope.$watch('glob.q_total',function(){
		$scope.q_total = $rootScope.glob.q_total;
	});
	$rootScope.$watch('glob.a_total',function(){
		$scope.a_total = $rootScope.glob.a_total;
	});
	$rootScope.$watch('glob.type',function(){
		$scope.type=$rootScope.glob.type;
	})
	$rootScope.$watch('glob.tw_type',function(){
		$scope.tw_type=$rootScope.glob.tw_type;
	})
	$rootScope.$watch('glob.question',function(){
		$scope.question=$rootScope.glob.question;
	})
	//enable modals
	$scope.modal = function(x,quest){
		modal.toggle(x,quest);
	}
	fetchQuest.hashcheck($rootScope.page[1]).then(function(data){
		$rootScope.glob.type=data[0].type;
		if(data[0].type=='#'){
			$rootScope.glob.tw_type='%23';
		}else{
			$rootScope.glob.tw_type=data[0].type;
		}

		getStats.total();
		getStats.batch().then(function(data) {
			if(data[0] != 'f'){
				$scope.questions = data;
				for (var i = 0; i < $scope.questions.length; i++) {			
					$scope.questions[i].url=encodeURIComponent($location.$$protocol+'://'+$location.$$host+'/#/home/?id='+$scope.questions[i].id);			
					$scope.questions[i].votes = parseInt($scope.questions[i].votes);
					$scope.questions[i].yes = Math.round($scope.questions[i].yes/$scope.questions[i].votes*100);
					$scope.questions[i].no = Math.round($scope.questions[i].no/$scope.questions[i].votes*100);
					$scope.questions[i].meh = Math.round($scope.questions[i].meh/$scope.questions[i].votes*100);
					$scope.questions[i].tweet=encodeURIComponent($rootScope.glob.type+$rootScope.glob.question+' -'+$scope.questions[i].text+'\n\n│↑'+$scope.questions[i].yes+'%↑│~'+$scope.questions[i].meh+'%│↓'+$scope.questions[i].no+'%↓│'+$scope.questions[i].votes+' votes│\n');				
				}
			}		
		});
	});

	
}]);
poll.controller('hashcloud',['$scope','$http',function($scope,$http){
		$http.post('../php/connect.php', {'method':'gethash'}).success(function(data) {
			if(data != "false"){
				$scope.hcount=data.length;
				var qtotal=0;
				for (var i = 0; i < data.length; i++){
					qtotal=qtotal+data[i].qcount*1
				}
				for (var i = 0; i < data.length; i++){
					if(data[i].acount == 0){
						var acount = 1;
					}else{
						var acount = data[i].acount;
					}
					data[i].sort=(data[i].acount/data[i].qcount)*(data[i].qcount/qtotal);
					if(data[i].sort <= .2 && data[i].sort >= .075){
						data[i].scale = data[i].sort*10;
					}else if (data[i].sort <= .075){
						data[i].scale = .75;						
					}else if(data[i].sort >= .2){
						data[i].scale = 2;
					}
					if(!data[i].sort){
						data[i].sort=0;
						data[i].scale = .5;
					}
				}
				$scope.hashes=data;
			}else{
				$scope.hashes=[{"schema_name":"NothingHereYet"}];
			}				
		})	
}]);				
poll.controller('addhash',['$scope','$http',function($scope,$http){
	$scope.type='#';
	$scope.subhash=function(text,type){
		$http.post('../php/connect.php', {'method':'addhash','text':text, 'type':type}).success(function(data) {
			window.location="/#/"+text+"/base?firstrun=true";		
		})
		
	}
	$scope.newhash='';
	$scope.rclass='';
	$scope.$watch('type',function(){
		if($scope.type=='@'){
			$scope.rclassa=true;
			$scope.rclassh=false;
		}else{
			$scope.rclassa=false;
			$scope.rclassh=true;			
		}
	});
	$scope.$watch('newhash',function(){
		if(isFinite(String($scope.newhash[0]))){
			$scope.newhash = $scope.newhash.substring(1);
		}
		$scope.newhash = $scope.newhash.replace(/[^\w]/gi, '')
		if($scope.newhash.length > 15){
			$scope.newhash = $scope.newhash.substring(0, $scope.newhash.length - 1);
		};
	})
	
}]);
