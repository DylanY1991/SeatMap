(function() { 'use strict';

const appStart = angular.module('appStart', ['ngRoute','seatMap']);

appStart.config(function($routeProvider, $locationProvider) {
    // Remove prefix #!/ - Angular.js 1.6
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // route control - currently only has one
    $routeProvider
        .when('/', {
            templateUrl: 'index.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});

})();