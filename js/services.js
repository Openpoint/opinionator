'use strict';
poll.service('innit',function($rootScope,$cookieStore,$http){
	return{
		always : function(prefix){
			//define the rootScope
			if(!$rootScope.glob){
				$rootScope.glob={};
			}
			$rootScope.glob.change=0;
			$rootScope.glob.qlimit=6;
			if(!$rootScope.glob.answered){
				$rootScope.glob.answered=new Array();
			}
			
			
			if(!$rootScope.glob.message){
				$rootScope.glob.message={};
			}
			if(!$rootScope.glob.cookie){
					$rootScope.glob.cookie={};
			}
			//check for and get cookie
			if($cookieStore.get('user')){
				$rootScope.glob.cookie=$cookieStore.get('user');
			}
			if($cookieStore.get('auth')){
				$rootScope.glob.authorised=$cookieStore.get('auth').authorised;
			}
			if(prefix){
				$rootScope.glob.question=prefix;
				if(!$rootScope.glob[prefix]){
					$rootScope.glob[prefix]={};
				}
				if(!$rootScope.glob[prefix].oldquest){
					$rootScope.glob[prefix].oldquest={};
				}
				if(!$rootScope.glob.cookie[prefix]){
					$rootScope.glob.cookie[prefix]={};
				}

			}					
		}
	}	
})

/* Various functional interactions with the databases through PHP. Each method identified by 'method' key in request */
poll.service('fetchQuest',function($q,$http,$route,$rootScope,$location,$sce,$cookieStore) {
	return{
		del : function(x){
			$http.post('../php/connect.php', {'method':'del','id':x,'hash':$rootScope.glob.question}).success(function(){
				$rootScope.glob[$rootScope.glob.question].questions.forEach(function(item){
					if(x==item.id){
						var index = $rootScope.glob[$rootScope.glob.question].questions.indexOf(item);
						$rootScope.glob[$rootScope.glob.question].questions.splice(index, 1);
					};
					
				})
			});				
		},		
		batch : function(x,z,$scope,id,admin){
			$scope.thisquest=$sce.trustAsHtml('<div class="loading"></div>');
			var defer = $q.defer();
			$http.post('../php/connect.php', {'method':'fetch', 'get_results':z, 'limit':x, 'id':id, 'answered':$rootScope.glob.answered,'hid':$rootScope.glob.hid,'admin':admin}).success(function(data, status, headers, config) {
				if(!data.questions){
					$rootScope.glob.alldone=true;					
				}else{
					$rootScope.glob.alldone=false;
				}
				defer.resolve(data);
			}).error(function(){
					window.location.reload();
			});
			

			return defer.promise;
		},
		add : function(text,official,$scope) {
			var defer = $q.defer();
			$http.post('../php/connect.php', {'method':'send','text': text,'official':official,'hid':$rootScope.glob.hid,'ip':$rootScope.glob.ip}).success(function(data) {
				if($route.current.controller != 'go_prefix'){
					if($rootScope.glob.questions){
						$rootScope.glob.questions.push(data[0]);
					}else{
						$rootScope.glob.questions=data;
					}
					$scope.text=null;				
					var form = document.getElementById('textinput');
					location.reload();
				}else{
					$scope.hidden_aq=true;
					$rootScope.glob.newquestion = data[0];
					$scope.text=null;
					$scope.add_quest.$setPristine();
				}

				$rootScope.glob.created[$rootScope.glob.question]++;
				$rootScope.glob.change++;
				
				$cookieStore.put('created',$rootScope.glob.created);
				$cookieStore.put('user',$rootScope.glob.cookie);	
				$rootScope.glob.notice.text='Thanks! Your opinion has been added. It is queued for your next vote.';
				$rootScope.glob.notice.show=true;			
			}).error(function() {
				$rootScope.glob.notice.text='Sorry, there was an error. Try again later';
				$rootScope.glob.notice.show=true;		
			});
			return defer.promise;

		},
		hashcheck : function(hash,id){
			var defer = $q.defer();
			$http.post('../php/connect.php', {'method':'hashcheck','text': hash,'id':id}).success(function(data) {
				if(data[0].id){
					$rootScope.glob.hid=data[0].id;
					defer.resolve(data);					
				}else{
					window.location='/';
				}			
			});
			return defer.promise;
		},
		gethashid : function(id){
			var defer = $q.defer();
			$http.post('../php/connect.php', {'method':'gethashid','id':id}).success(function(data) {
				defer.resolve(data);
			});
			return defer.promise;
		},
		answered : function(prefix){
			
			$http.post('../php/connect.php', {'method':'getanswered','ip':$rootScope.glob.ip}).success(function(data){	
				//persistent get and set cookie for the clients answers. Controlled by time offset set in 'getanswered' method of connect.php TODO put in settings control			
				var answered=new Array();
				var qcreated={};
				for (var i = 0; i < data.length; i++) {
					if(data[i].aid){
						answered.push(data[i].aid)
					}
					if(data[i].hashid){
						qcreated[data[i].hashid]=data[i].qadded;
					}
				}
				$cookieStore.put('created',qcreated);
				$rootScope.glob.created=qcreated;
				$rootScope.glob.change++;
										
				if(!$cookieStore.get('answered')){
					$cookieStore.put('answered',answered);
					$rootScope.glob.answered=answered;				
				}else{
					$rootScope.glob.answered=$cookieStore.get('answered');
				}
				
			});			
			
		}

	}
});

/* Controls the actions when a user submits a vote */
poll.service('vote',function($timeout,$rootScope,$http,$sce,$cookieStore,$location){
	return{
		//sets the item value for the vote before countdown
		
		change : function(id,value,item,$scope){

			$scope.questions[$scope.count].answer=value;
			if(value == 'yes'){
				item.yes = true;
				item.no = false;
				item.meh = false;
				$scope.active1='active';
				$scope.active2=null;
				$scope.active3=null;
			}
			if(value == 'no'){
				item.yes = false;
				item.no = true;
				item.meh = false;
				$scope.active1=null;
				$scope.active2=null;
				$scope.active3='active';
			}
			if(value == 'meh'){
				item.yes = false;
				item.no = false;
				item.meh = true;
				$scope.active1=null;
				$scope.active2='active';
				$scope.active3=null;
			}
			$scope.results = {'method':'answer','id':id,'yes':item.yes,'no':item.no,'meh':item.meh,'ip':$rootScope.glob.ip,'city':$rootScope.glob.city,'country':$rootScope.glob.country,'hid':$rootScope.glob.hid};
		},
		//submission countdown - gives user foo seconds before the vote is committed
		timer : function($scope,item){
			$timeout.cancel($scope.settime);
			$timeout.cancel($scope.timersub);
			$scope.counter=4;
			
			// called after countdown and adds item to batch for submission 
			function clear(){
				$scope.oldquest.quest=$scope.questions[$scope.count];
				if($scope.sorted_stats[$scope.questions[$scope.count].id]){
					$scope.oldquest.stats=$scope.sorted_stats[$scope.questions[$scope.count].id];
				}else{
					$scope.oldquest.stats={};
					if($scope.questions[$scope.count].answer == 'yes'){
						$scope.oldquest.stats.yes=100;
						$scope.oldquest.stats.meh=0;
						$scope.oldquest.stats.no=0;
					}
					if($scope.questions[$scope.count].answer == 'meh'){
						$scope.oldquest.stats.meh=100;
						$scope.oldquest.stats.yes=0;
						$scope.oldquest.stats.no=0;
					}
					if($scope.questions[$scope.count].answer == 'no'){
						$scope.oldquest.stats.no=100;
						$scope.oldquest.stats.meh=0;
						$scope.oldquest.stats.yes=0;
					}
					$scope.oldquest.stats.total=1;
				}
				$scope.oldquest.tweet=encodeURIComponent('#'+$scope.hashtag+' -'+$scope.oldquest.quest.text+'\n\n│↑'+$scope.oldquest.stats.yes+'%↑│~'+$scope.oldquest.stats.meh+'%│↓'+$scope.oldquest.stats.no+'%↓│'+$scope.oldquest.stats.total+' votes│\n');				
				$scope.oldquest.e_url=encodeURIComponent($location.$$protocol+'://'+$location.$$host+'/#/home/?id='+$scope.oldquest.quest.id);
				$scope.oldquest.url=$location.$$protocol+'://'+$location.$$host+'/#/home/?id='+$scope.oldquest.quest.id;
				
				//Track where the user is
			
				$rootScope.glob.answered.push($scope.questions[$scope.count].id);
				$rootScope.glob[$rootScope.glob.question].oldquest=$scope.oldquest
				$rootScope.glob.cookie[$rootScope.glob.question].count=$scope.count;
				$rootScope.glob.cookie[$rootScope.glob.question].limit=$scope.limit;				
				$cookieStore.put('user',$rootScope.glob.cookie);
				$cookieStore.put('answered',$rootScope.glob.answered);
								
				//$rootScope.glob.oldquest=$scope.oldquest;
				
				
				//increments and sets top limit for the limit for 'addquestion' and batch to database
				if($scope.limit <= 5){
					$scope.limit++;
				}
				$scope.item.yes = false
				$scope.item.no = false;
				$scope.item.meh = false;
				$scope.active1=null;
				$scope.active2=null;
				$scope.active3=null;
				$rootScope.glob.notice.show=false;			
			}
			//submits the latest answer to the database
			function submit(){			
				$http.post('../php/connect.php',$scope.results).success(function(data) {
				})
			}
			//inside timer loop for the timer value
			$scope.timer = function(){
				$scope.counter--;
				$scope.timersub = $timeout(function(){
					$scope.timer()
					},1000);
			}
			if($scope.count < $scope.total-1){
				$scope.timer();
				//outside timer loop to control how long a user has to change their mind on vote
				$scope.settime = $timeout(function(){
					$scope.hidden_q=false;
					$scope.hidden_aq=true;
					$rootScope.glob.user_position=1;
					$rootScope.glob.cookie[$rootScope.glob.question].user_position=1;
					clear();				
					$scope.count++;
					$scope.thisquest=$sce.trustAsHtml($scope.questions[$scope.count].text);					
					$timeout.cancel($scope.timersub);
					$scope.counter=null;
					submit();					
				},3000);
			}else{
				$scope.timer();
				$scope.settime = $timeout(function(){
					$scope.hidden_q=false;
					$scope.hidden_aq=false;
					clear();
					$scope.counter=null;
					$scope.questions=null;					
					$scope.count=0;					
					$timeout.cancel($scope.timersub);
					$scope.offset=$scope.offset+$scope.limit;
					$scope.fetched();
					submit();
				},3000);
			}
		}
	}
});

/* calculates the stats for each individual answer on the main questions page */
poll.service('stats',function(){
	return {
		sort :function($scope,data){
			var sorted_stats={};
			for (var key in data) {
				var item = data[key];
				sorted_stats[item.id]={'yes':0,'no':0,'meh':0};				
			}
			for (var key in data) {
				var item = data[key];
				if(item.yes=='t'){
					sorted_stats[item.id].yes++;
				}
				if(item.no=='t'){
					sorted_stats[item.id].no++;
				}
				if(item.meh=='t'){
					sorted_stats[item.id].meh++;
				}				
			}
			for (var key in sorted_stats){
				sorted_stats[key].total=sorted_stats[key].yes+sorted_stats[key].no+sorted_stats[key].meh;
				sorted_stats[key].yes=Math.round(sorted_stats[key].yes/sorted_stats[key].total*100);
				sorted_stats[key].no=Math.round(sorted_stats[key].no/sorted_stats[key].total*100);
				sorted_stats[key].meh=Math.round(sorted_stats[key].meh/sorted_stats[key].total*100);
			}
			$scope.sorted_stats=sorted_stats;
		}	
	}
});

/* Gets the data for the statistics page */
poll.service('getStats',function($q,$http,$rootScope) {
	return{		
		batch : function(){			
			var defer = $q.defer();
			$http.post('../php/data.php', {'answered':$rootScope.glob.answered,'hid':$rootScope.glob.hid}).success(function(data, status, headers, config) {
				defer.resolve(data);
			});
			return defer.promise;
		},
		total : function(){
			$http.post('../php/connect.php', {'method':'total','hid':$rootScope.glob.hid,'answered':$rootScope.glob.answered}).success(function(data){
				$rootScope.glob.q_total=data[0].total;
				$rootScope.glob.a_total=data[0].answered;
			});			
		}
	}		
});

/* Controls the modal overlays */
poll.service('modal',function($rootScope,$location,$q,$http){
	return{
		validate : function(){
			var defer = $q.defer();
			$http.post('../php/connect.php', {'method':'validate'}).success(function(data){
				defer.resolve(data);
			});
			return defer.promise;
		},
		remove : function(x){
			var defer = $q.defer();
			$http.post('../php/connect.php', {'method':'remove','text':x}).success(function(data){
				defer.resolve(data);
			});
			return defer.promise;

		},
		login : function(user,password){
			
			var defer = $q.defer();
			$http.post('../php/auth.php', {'method':'login','username':user,'password':password}).success(function(data) {
				defer.resolve(data);
			});
			return defer.promise;
			
		},
		toggle :function(x,oldquest){
			$rootScope.glob.modal = $rootScope.glob.modal === false ? true: false;
			
			//hack to convert oldquest between question page and stats page - TODO clean up standards in next release
			
			if($rootScope.glob.modal == false && x!='login' && x!='del'){
				if(!oldquest.quest){
					var temp = oldquest;
					console.log(temp);
					oldquest={}
					oldquest.url=$location.$$protocol+'://'+$location.$$host+'/#/home/?id='+temp.id;
					oldquest.quest={};
					oldquest.quest.text=temp.text
					oldquest.stats={};
					oldquest.stats.total=temp.votes;
					oldquest.stats.yes=temp.yes;
					oldquest.stats.meh=temp.meh;
					oldquest.stats.no=temp.no;
				}
			}
			
			if(!$rootScope.glob.modal && x=='link'){
				$rootScope.glob.message.link='<div class="mmessage">Copy the URL below for a direct link to this question.<br><br><div class="pre">'+oldquest.url+'</div></div>';
				$rootScope.glob.message.active=$rootScope.glob.message.link;	
			}
			if(!$rootScope.glob.modal && x=='email'){
				$rootScope.glob.message.mail='<h1><a href="https://twitter.com/search?q='+$rootScope.glob.tw_type+$rootScope.glob.question+'">'+$rootScope.glob.type+$rootScope.glob.question+'</a></h1><br><div class="quest">'+oldquest.quest.text+'</div><br><br>'+'Of '+oldquest.stats.total+' votes:<br>&#9474;&uarr;'+oldquest.stats.yes+'%&uarr;&#9474;~'+oldquest.stats.meh+'%&#9474;&darr;'+oldquest.stats.no+'%&darr;&#9474;<br><br>Have your say:<br><a href="'+oldquest.url+'">'+oldquest.url+'</a>'
				$rootScope.glob.message.plain=$rootScope.glob.type+$rootScope.glob.question+'\r\n\r\n'+oldquest.quest.text+'\r\n\r\nOf '+oldquest.stats.total+' votes:\r\n│↑'+oldquest.stats.yes+'%↑│~'+oldquest.stats.meh+'%│↓'+oldquest.stats.no+'%↓│\r\n\r\n'+oldquest.url;

				var form='<div class="infield" ng-class="{required : email.sender.$error.required}"><input type="text" ng-model="sender" name="sender" required/><label ng-hide="email.sender.$viewValue">Your Name: </label></div><div class="infield"><input type="email" ng-model="sender_add" name="sender_add"/><label ng-hide="email.sender_add.$viewValue">Your Email: </label></div><div class="infield" ng-class="{required : email.recipient.$error.required}"><input type="email" name="recipient" ng-model="recipient" required/><label  ng-hide="email.recipient.$viewValue">Email To: </label></div>';
				var form2 ='<div class="infield"><textarea ng-model="umessage" name="umessage"></textarea><label ng-hide="umessage">Optional message</label></div>'
				$rootScope.glob.message.form='<div class="mmessage"><form novalidate name="email">'+form+'<div class="pre">'+$rootScope.glob.type+$rootScope.glob.question+'<br><br>'+oldquest.quest.text+'<br><br>&#9474;&uarr;'+oldquest.stats.yes+'%&uarr;&#9474;~'+oldquest.stats.meh+'%&#9474;&darr;'+oldquest.stats.no+'%&darr;&#9474;<br><br>'+'Of '+oldquest.stats.total+' votes<br><br>'+oldquest.url+'</div>'+form2+'</form><button ng-click="mail(recipient,sender,sender_add,umessage)" ng-disabled="email.$invalid">Send Email</button></div>';	
				$rootScope.glob.message.active=$rootScope.glob.message.form;
			}
			if(!$rootScope.glob.modal && x=='login'){
				
				$rootScope.glob.message.link='<div class="mmessage"><form novalidate name="login" ng-submit="login2(user,password)"><div class="infield" ng-class="{required : login.user.$error.required}"><input id="username" type="text" ng-model="user" name="user" required/><label ng-hide="login.user.$viewValue">Username or Email:</label></div><div class="infield" ng-class="{required : login.password.$error.required}"><input id="userpass" type="password" ng-model="password" name="password" required/><label ng-hide="login.password.$viewValue">Password:</label></div><input type="submit" value="Login" ng-disabled="login.$invalid"></form></div>';
				$rootScope.glob.message.active=$rootScope.glob.message.link;	
			}
			if(!$rootScope.glob.modal && x=='del'){
				
				$rootScope.glob.message.link='<div class="mmessage">Are you sure your want to delete this stream completely?<br>This cannot be undone.</div><button ng-click="adelete()">Delete</button>';
				$rootScope.glob.message.active=$rootScope.glob.message.link;	
			}
		}
	}
});

/* Controls PHP email interface */
poll.service('email',function($http,$q,$rootScope){
	return{
		send : function(recipient,sender,sender_add,umessage,mailmessage,plainmessage,hash){
			$rootScope.glob.message.active="<div class='esuccess'>Sending.....</div>";
			var defer = $q.defer();
			$http.post('../php/mail.php',{"to":recipient,"from":sender,"reply":sender_add,"stat":mailmessage,'stat2':plainmessage,"custom":umessage,'hash':hash}).success(function(data, status, headers, config) {
				defer.resolve(data);
			});
			return defer.promise;			
		}		
	}	
});
