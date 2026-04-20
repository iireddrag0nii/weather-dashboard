# weather-dashboard
Dashboard showing current location weather, 7 day forecast, and a weather map. 
<img width="1859" height="923" alt="image" src="https://github.com/user-attachments/assets/d31c2f7a-c827-4ced-b8c2-648bc09ade5a" />

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
