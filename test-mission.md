# Test Mission - Wed 06 May 2026 08:05:11 PM EDT

This file was created successfully.
I did this simple tests:
````text
1- I send a private msg to dev agent :
```
    Dev Moussawer, create a file called test-mission.md in /srv/dev/moussawer/ with the content: '#
     Test Mission - $(date)\n\nThis file was created successfully.' Then read it back to me and     
    reply with the file contents.
```
he executed his mission perfectly.

2- I send this message in the group of all agent:
```
Dev Moussawer, create a file called test-mission_[your_name].md in /srv/dev/moussawer/ with the content: '#
     Test Mission - $(date)\n\nThis file was created successfully.' Then read it back to me and     
    reply with the file contents.
```
all the ai agent starting working in the same time and each create a file with it's name.

3- I send this message in the group of all agent:
```
This mission is only for agent dev, if you're not this agent do not execute it, the mission:
"Dev Moussawer, create a file called test-mission_[your_name].md in /srv/dev/moussawer/ with the content: '#
     Test Mission - $(date)\n\nThis file was created successfully.' Then read it back to me and     
    reply with the file contents."
```
only dev
````
it should not work like this when I send a msg

