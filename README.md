# Prototype Smoother timeline

This is a recreation of the timeline feature of vscode because its missing some key features that I need and the file comparator isnt really nice  
The code is a mess but its good enough, this extension will be deprecated when the proposed api for the timeline release  

You can look it up right here

- [Proposed timeline](https://github.com/microsoft/vscode/blob/main/src/vscode-dts/vscode.proposed.timeline.d.ts)
- [Github issue](https://github.com/microsoft/vscode/issues/84297)

If the proposed api never release I might remake this extension into something way cleaner

If you use this extension, you might want to deactivate the real timeline of vscode by adding this line in your **settings.json**
```json
"workbench.localHistory.enabled": false
```

<!-- ![Timeline showcase gif](/readme/timeline_showcase.gif)
![Compare showcase gif](/readme/compare_showcase.gif) -->
<!-- 2560x1440 -->
## Timeline
<img src="./readme/timeline_showcase.gif" width="640" height="360" />

- includes Save, Undo and Redo point
 
## Compare
<img src="./readme/compare_showcase.gif" width="640" height="360" />

- Keep comparing with the original file