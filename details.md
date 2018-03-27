## Preview
![paperclip logo preview above discussion group](img/preview.png)
## Drag and Drop
![dragging paperclip logo onto attachments group](img/dragAndDrop.png)
## Click to show fullsize
![click paper logo](img/clickThumbnail.png)  
![dialog with larger image of paper clip logo](img/largerPreview.png)

# Configuration with on Team Services 

To configure where the board group is added click on the customize option from the work item form.  
![customize context image](img/customizeToolbar.png)  
Then drag the group where desired or hide it.  
![customize form](img/customizeForm.png)

# Configuration using process template

Navigate the process template xml.
For each work item type to customize at the location 
```xpath
/WITD/WORKITEMTYPE/FORM/WebLayout/Extensions
```
add 
```xml
<Extension Id="ottostreifel.attachments-group" />
```
Within the same Weblayout choose a Section element and add
```xml
<GroupContribution Label="Attachments" Id="ottostreifel.attachments-group.attachments-group"/>
```

# Change Log
(3/26/18) 1.0.1 Initial Release