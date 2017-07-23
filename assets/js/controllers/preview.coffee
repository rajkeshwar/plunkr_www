#= require ./../services/plunks
#= require ./../services/visitor

#= require ./../directives/addthis
#= require ./../directives/gallery
#= require ./../directives/overlay
#= require ./../directives/plunkinfo
#= require ./../directives/timeago

module = angular.module "plunker.preview", [
  "plunker.addthis"
  "plunker.plunks"
  "plunker.visitor"
  "plunker.gallery"
  "plunker.overlay"
  "plunker.plunkinfo"
  "plunker.timeago"
]


module.config ["$routeProvider", ($routeProvider) ->
  $routeProvider.when "/:plunk_id",
    template: """
      <div id="preview" class="container">
        <div class="row">
          <div class="span12">
            <h1>{{plunk.description}} <small>({{plunk.id}})</small></h1>
            <ul class="operations">
              <li>
                <a class="btn btn-primary" ng-href="/edit/{{plunk.id}}">
                  <i class="icon-edit"></i>
                  Launch in Editor
                </a>
              </li>
              <li>
                <a class="btn" ng-href="{{plunk.raw_url}}" target="_blank">
                  <i class="icon-fullscreen"></i>
                  Launch Fullscreen
                </a>
              </li>
              <li ng-show="visitor.logged_in">
                <button class="btn" ng-click="plunk.star()" ng-class="{starred: plunk.thumbed}">
                  <i class="icon-star"></i>
                  <span ng-show="plunk.thumbed">Unstar</span>
                  <span ng-hide="plunk.thumbed">Star</span>
                </button>
              </li>
              <li ng-switch="!!plunk.created_at">
                <div ng-switch-when="true" class="addthis_default_style addthis_20x20_style" addthis-toolbox addthis-description="{{plunk.description}}" addthis-path="/{{plunk.id}}">
                  <a target="_self" class="addthis_button_twitter"></a>
                  <a target="_self" class="addthis_button_facebook"></a>
                  <a target="_self" class="addthis_button_google_plusone_share"></a>
                  <a target="_self" class="addthis_button_linkedin"></a>
                  <a target="_self" class="addthis_button_compact"></a>
                </div>
              </li>
            </ul>
            <div class="frame">
              <iframe frameborder="0" width="100%" height="100%" ng-src="{{plunk.raw_url}}"></iframe>
            </div>
            
            <div class="about">
              <plunker-plunk-info plunk="plunk"></plunker-plunk-info>
      
              Last saved by
              <plunker-inline-user user="plunk.user"></plunker-inline-user>
              <abbr timeago="{{plunk.updated_at}}"></abbr>
              
            </div>
          </div>
        </div>
        <div id="plunk-feed" class="feed">
          <div class="row">
            <div class="span12">
              <h2>Event Feed</h2>
            </div>
          </div>
          <div class="row event" ng-repeat="event in plunk.feed | orderBy:'-date'" ng-class="{{event.type}}" ng-switch on="event.type">
            <hr class="span12"></hr>
            <div ng-switch-when="fork">
              <div class="span1 type"><i ng-class="event.icon"></i></div>
              <div class="span11">
                <plunker-inline-user user="event.user"></plunker-inline-user>
                forked this plunk off of <plunker-inline-plunk plunk="event.parent">{{event.parent.id}}</plunker-inline-plunk>
                by <plunker-inline-user user="event.parent.user"></plunker-inline-user>
                <abbr timeago="{{event.date}}"></abbr>.
              </div>
            </div>
            <div ng-switch-when="create">
              <div class="span1 type"><i ng-class="event.icon"></i></div>
              <div class="span11">
                <plunker-inline-user user="event.user"></plunker-inline-user>
                created this plunk
                <abbr timeago="{{event.date}}"></abbr>.
              </div>
            </div>
            <div ng-switch-when="forked">
              <div class="span1 type"><i ng-class="event.icon"></i></div>
              <div class="span11">
                <plunker-inline-user user="event.user"></plunker-inline-user>
                created <plunker-inline-plunk plunk="event.child">{{event.child.id}}</plunker-inline-plunk>
                by forking this plunk
                <abbr timeago="{{event.date}}"></abbr>.
              </div>
            </div>
          </div>
        </div>
      </div>
      """
    resolve:
      plunk: ["$route", "plunks", ($route, plunks) ->
        plunk = plunks.findOrCreate(id: $route.current.params.plunk_id)
        plunk.refresh() unless plunk.$$refreshed_at
        plunk
      ]
      
    controller: ["$rootScope", "$scope", "$routeParams", "visitor", "plunk", ($rootScope, $scope, $routeParams, visitor, plunk) ->
      $rootScope.page_title = plunk.description or "Untitled plunk"
      
      $scope.plunk = $rootScope.plunk = plunk
      $scope.visitor = visitor
    ]
]