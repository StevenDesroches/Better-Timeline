###  Prototype of a better timeline
Quick and dirty because an issue is open on github for an api for the timeline
But I still needed that extension for myself because i was losing some of my work by undoing and redoing

[Proposed timeline](https://github.com/microsoft/vscode/blob/main/src/vscode-dts/vscode.proposed.timeline.d.ts)
[Github issue](https://github.com/microsoft/vscode/issues/84297)

I will keep updating this extension for my use case

If you use this extension, you might want to deactivate the real timeline of vscode by adding this line in your **settings.json**
```json
"workbench.localHistory.enabled": false
```
### Todo
- [ ] add additional conditions
    - [ ] max file size for a timelineNode
- [ ] adding settings
    - [ ] max files
    - [ ] max file size
- [ ] Quick logo
- [ ] rework the README
- [ ] add gifs