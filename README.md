# weather-dashboard
Dashboard showing current location weather, 7 day forecast, 24 hour hourly forecast, and a weather map. 
<img width="880" height="892" alt="image" src="https://github.com/user-attachments/assets/8ee4bbeb-7657-4476-b290-8a5c1d1d0007" />


*Latest updates (4/25/26)*: 
Got the 24 hour hourly forecast to work. 
Tweaked mobile mode so that buttons and text wouldn't overlap. 
Fixed the sunrise and sunset time in the 7 day forecast so that it was more visible. 

*Latest updates (4/24/26)*: 
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

To see a live demo of this go to https://weather.hbtechsolutions.com

Prerequistes: 

1. Make sure you have docker installed and running.

Instructions: 

1. Clone the files into your local repository.
2. CD to the weather-dashboard folder.
3. Run docker compose up -d --build command. It will build two containers.
4. Navigate to yourip:8888

To Update: 

1. CD to the weather-dashboard folder on your local machine. 
2. Run docker compose down -v.
3. Delete the current weather-dashboard folder from your local directory.
4. Clone the files into your local respository.
5. Run docker compose up -d --build command. It will create the updated containers.  

NOTE: I saved the old version of server.js (backend) and index.html (frontend) as (old) files. If you wish to use the old version, delete the current server.js and index.html files and rename the server.js(old) and index.html(old) to server.js and index.html respectfully. When you run docker compose up -d --build command, it will build the old version. 
