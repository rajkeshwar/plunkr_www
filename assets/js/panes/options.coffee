#= require ./../services/panes
#= require ./../services/settings

module = angular.module("plunker.panes")

module.requires.push "plunker.settings"


module.run [ "panes", "settings", (panes, settings) ->

  panes.add
    id: "options"
    icon: "cog"
    size: 252
    order: 1000
    title: "Editor Options"
    description: """
      Customize the theme of the editor, key bindings, indentation options and much more.
    """
    template: """
      <div class="plunker-options">
        <form>
          <fieldset>
            <legend>Editor</legend>
            <label>Theme:
              <select class="input-medium" id="opts-editor-theme" ng-model="settings.editor.theme" ng-options="theme for theme in themes"></select>
            </label>
            <label>Key Binding:
              <select class="input-medium" id="opts-editor-keyboard-handler" ng-model="settings.editor.keyboard_handler" ng-options="kh for kh in keyboard_handlers"></select>
            </label>
            <label>Tab size:
              <input class="input-mini" id="opts-editor-tabSize" ng-model="settings.editor.tab_size" type="number">
            </label>
            <label>Font size:
              <input class="input-mini" id="opts-editor-fontSize" ng-model="settings.editor.font_size" type="number" min="8">
            </label>
            <label class="checkbox">
              <input class="input-mini" id="opts-editor-lineWrap" ng-model="settings.editor.wrap.enabled" type="checkbox">
              Line wrapping
            </label>
          </fieldset>
          <fieldset>
            <legend>Previewer</legend>
            <label>Refresh interval:
              <input class="input-small" id="opts-previewer-delay" ng-model="settings.previewer.delay" ng-disabled="!settings.previewer.auto_refresh" type="number" />
            </label>
            <label class="checkbox">
              <input type="checkbox" ng-model="settings.previewer.auto_refresh" />
              Auto refresh
            </label>
          </fieldset>
        </form>
      </div>
    """
    link: ($scope, $el, attrs) ->
      $scope.settings = settings
      $scope.keyboard_handlers = [
        "ace"
        "emacs"
        "vim"
      ]
      $scope.themes = [
        "ambiance"
        "chrome"
        "clouds"
        "clouds_midnight"
        "crimson_editor"
        "dawn"
        "dreamweaver"
        "eclipse"
        "github"
        "idle_fingers"
        "kr_theme"
        "merbivore"
        "merbivore_soft"
        "monokai"
        "pastel_on_dark"
        "solarized_dark"
        "solarized_light"
        "textmate"
        "tomorrow"
        "tomorrow_night"
        "tomorrow_night_blue"
        "tomorrow_night_bright"
        "twilight"
        "vibrant_ink"
        "xcode"
      ]
]