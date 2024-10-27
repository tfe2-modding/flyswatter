# Flyswatter

Flyswatter is a work-in-progress mod for helping the process of developing other mods for The Final Earth 2. It contains viewable performance stats, some simple cheats for testing things, an in-game buildinginfo editor, and a way for mods to create their own debuggers. To use the tools this mod has to offer, simply right click anywhere on the screen and select an option.

## Creating a custom debugger

The function `FlySwatter.registerDebugger(name: string, create: function(document))` will register a new debugger to be displayed in the right click menu. When the option is selected, it will create a pseudo-window inside of the game and opens up an iframe at about:blank with some default styling. Once the iframe finishes loading, it will pass the iframe's `document` to your `create` function. All you have to do is add the UI elements and connect them to various functions in the city. You can access `FlySwatter.city` at any point to get the most recently created city.

## Contributing

If you would like to contribute, please help expand the built-in debuggers. The mod uses the same API available to other mods internally.

## Known issues

- Not all keyboard shortcuts work while you have a debugger selected due to the iframe capturing the inputs. Should probably see if it's possible to pass any keyboard input from the iframe to the main window.
