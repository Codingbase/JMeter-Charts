'use strict';

define([
	'angular',
	'angularRoute'
], function(angular) {
	// Declare app level module which depends on views, and components
	return angular.module('JMeterCharts', [
		'ngRoute',
        'ui.bootstrap'
	]).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/index.html'});
	}]);
});