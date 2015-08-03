
var myApp = angular.module('myApp', ['ui.router'], function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptor')
});
myApp.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

  $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'login.html',
        controller: 'loginCtrl as vm',
        requireLogin: 'NO'
      })
      .state('home', {
        url: '/home',
        templateUrl: 'home.html',
        controller: 'homeCtrl as vm',
        requireLogin: 'Yes'
      })

      .state('other', {
        url: '/other',
        templateUrl: 'other.html',
        controller: 'otherCtrl as vm',
        requireLogin: 'Yes'
      })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

}])


myApp.constant ('API_URL', 'http://localhost:3000');

myApp.controller("loginCtrl", loginCtrl);
myApp.controller("homeCtrl", homeCtrl);
myApp.controller("otherCtrl", otherCtrl);



function loginCtrl(RandomUserFactory,UserFactory, $scope, $state){
  console.log('------------login ctrl');
  var first = this;

  first.login = login;






  function login(){
    
    console.log('------------login');

  	UserFactory.login (first.username,first.password).then(function success(response){
  		first.user = response.data.user;
      console.log('token:' + response.data.token);
      $state.go('home')

  	}, handleError);

  	function handleError(response){
  		console.log ('errore.....')
  	}

  }


}




function homeCtrl(UserFactory,RandomUserFactory,UserFactory, $state){

  console.log('dentro home ctrl....xx');
  console.log($state.current.data);
  var vm = this;
  UserFactory.getUser().then(function success (response) {
    vm.user = response.data;
  });

  vm.getRandomUser = getRandomUser;
  vm.logout = logout;

  function logout(){
    UserFactory.logout();
    vm.user = null;
    $state.go('login')

  }



  function getRandomUser(){
    RandomUserFactory.getUser().then(function success(response){
      vm.randomUser = response.data;
    })
  }



}

function otherCtrl(){


}

myApp.factory('RandomUserFactory',RandomUserFactory);

function RandomUserFactory($http,API_URL){
	return {
		getUser : getUser
	};

	function getUser(){
		return $http.get(API_URL + "/randomUser");
	}
}



myApp.factory('UserFactory',UserFactory);

function UserFactory($http,API_URL, AuthTokenFactory, $q){
	return {
		login:login,
        logout:logout,
        getUser:getUser
	};

	function login(username,password){
		return $http.post(API_URL + "/login", {'username':username,'password':password}).
      then (function success(response){
        AuthTokenFactory.setToken (response.data.token);
        return response;
      });
    }

  function logout(){
    AuthTokenFactory.setToken();

  }
  function getUser(){

    if (AuthTokenFactory.getToken()){
      return $http.get(API_URL + "/me");
    } else{
      return $q.reject({data: 'Client has no auth token'});
    }

  }
}

myApp.factory('AuthTokenFactory', AuthTokenFactory);

function AuthTokenFactory($window){
  var store = $window.localStorage;
  var key = 'auth-token';
  return {
    getToken : getToken,
    setToken : setToken
  }

  function getToken(){
    return store.getItem(key);

  }

  function setToken(token){
    if (token){
      store.setItem(key,token);
    } 
    else
      store.removeItem(key);
    
  }
}

myApp.factory('AuthInterceptor', AuthInterceptor);

function AuthInterceptor(AuthTokenFactory){

  return {
    request:addToken

  }
  function addToken(config){
    var token = AuthTokenFactory.getToken();
    if (token){
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + token;

    }

    return config;

  }

}

myApp.run(['$rootScope', '$state', function ($rootScope, $state) {
  $rootScope.$on('$stateChangeStart', function (event, next) {

    console.log('Sto per cambiare....');
    //console.log(next.requireLogin);
    if (next.requireLogin === 'Yes'){
      //event.preventDefault();
      console.log(next.requireLogin);
      //$state.go('login');
    }

  });
}]);






