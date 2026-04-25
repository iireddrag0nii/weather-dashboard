# weather-dashboard
Dashboard showing current location weather, 7 day forecast, and a weather map. 
<img width="1876" height="924" alt="image" src="https://github.com/user-attachments/assets/669eec4a-f649-4319-b838-e1124b75e6ac" />

*Latest updates (4/24/26)*
Added the ability to save locations.
Change from light to dark mode and vice versa.
Added sunrise and sunset times.
Added a share link button. 
Added a satellite radar map overlay mode. 
Added a 'feels like', UV index, wind direction and speed, and dew point. 
Added a button to change between m/s and mph. 
Visual improvements. 


This was put together after the pi weather station issues that I ran into after hosting it for years. 

This is currently hosted as a docker container. Included is the docker compose file needed as well as supporting files. 

The dashboard will show the following: 

Current location (will only show current location if done via https (I used NPM and created a SSL cert that forces https. Created a subdomain that is used for it) (if done via http only, this will not work)
Search Bar to allow you to search a different location (if using http, this is how you would find your current location). 
Option to switch between F and C (Page load defaults to C)
Current conditions
7 Day Forecast
Weather Map

This is currently work in progress but currently does function. There are a few tweaks that need to be worked out and I welcome anyone who wishes to contribute to the code. I will be working on this on my spare time. 

It is mobile friendly so it loads via web browser on phones and tablets as well. 
