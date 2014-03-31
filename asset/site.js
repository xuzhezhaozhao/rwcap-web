
(function () {

	var pages = [];
	$.each(["Home", "Download", "Examples", "Document", "Contact"], function () {
			var n = String(this);
			var p = "/" + n.toLowerCase();
			var t = "template" + p + ".html";
			pages.push({name: n, path: p, template: t});
	});

  var site = angular.module("site", ["ngRoute"]);

	site.config(function ($routeProvider) {
		$.each(pages, function () {
			$routeProvider.when(this.path, {
				templateUrl: this.template,
			});
		});
		$routeProvider.
		otherwise({
			redirectTo: "/home",
		});
	});

	function NavbarCtrl($scope, $location) {
		$scope.items = [];
		$.each(pages, function () {
			$scope.items.push({active: "", name: this.name, href: this.path});
		});
		$scope.active = function (c) {
			return c == $location.path() ? "active" : "";
		};
	}
	site.controller("NavbarCtrl", NavbarCtrl);

	function DownloadCtrl($scope, $http) {
		$http.get("json/downloads.json").success(function (data) {
			$scope.downloads = data;
		});
	}
	site.controller("DownloadCtrl", DownloadCtrl);

	function DocumentCtrl($scope, $http) {
		$http.get("json/docs.json").success(function (docs) {
			for (var i in docs) {
				var d = docs[i];
				d.id = d.title.toLowerCase().substr(0, 5);
			}
			$scope.docs = docs;
		});
		$scope.templates = function (id) {
			return "template/docs/" + id + ".html";
		}
	}
	site.controller("DocumentCtrl", DocumentCtrl);

	site.directive('scrollSpy', function () {
		function controller($scope) {
			var spies = $scope.spies = {};
			this.addspy = function (id, type, elem) {
				spies[id] = spies[id] || {};
				spies[id][type] = elem;
			};
		}
		function link(scope, elem, attrs) {
			$(window).scroll(function () {
				var active = null, spies = scope.spies, bottom = null;
				for (var id in spies) {
					var item = spies[id];
					if ( !item.spy || !item.spied || !item.spied.offset() ) {
						continue;
					}
					item.spy.removeClass("active");
					var pos = item.spied.offset().top - 120;
					if ( pos <= window.scrollY ) {
						item.pos = pos;
						if ( !active || active.pos < item.pos ) {
							active = item;
						}
					}
          if ( !bottom || bottom.pos < pos ) bottom = item;
				}
        if ( $(window).height() + $(window).scrollTop() == $(document).height() )
          active = bottom;
				if ( active ) {
					active.spy.addClass("active");
				}
			});
		}
		return {controller: controller, link: link};
	});

	site.directive('spy', function ($location, $anchorScroll) {
		return {
			require: "^scrollSpy",
			link: function(scope, elem, attrs, require) {
				require.addspy(attrs.spy, "spy", elem);
			}
		};
	});

	site.directive("spied", function () {
		return {
			require: "^scrollSpy",
			link: function (scope, elem, attrs, require) {
				require.addspy(attrs.id, "spied", elem);
			}
		};
	});

	site.directive("loadText", function ($http) { 
    return function (scope, elem, attrs) {
      $http.get(attrs.loadText).success(function (data) {
        elem.text(data);
      });
    };
  });

  function scrollto(x, d) {
    if ( typeof d == "number" ) {
      setTimeout(function () { scrollto(x); }, d);
    } else {
      if ( typeof x == "string" ) x = $("#"+x).offset().top - 70;
      else if ( typeof x == "object ") x = $(x).offset().top - 70;
      $(window).scrollTop(x);
    }
  }

  site.run(function($rootScope) {
    $rootScope.scrollto = scrollto;
    $rootScope.$on('$routeChangeSuccess', function () { scrollto(0); });
  });

})();
