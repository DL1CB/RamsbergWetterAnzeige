
# Ramsberg Wetter Anzeige

## About

This is the software to drive the weather informaiton
display at Ramsberg Harbour. A wifi enabled Raspberry Pi B+,
with a USB-RS485 serial dongle is used to push serial 
data to the display every 10 seconds.

Weather data comes from two sources:
1) https://www.wunderground.com/personal-weather-station/dashboard?ID=IPLEINFE4
2) https://www.gkd.bayern.de/de/meteo/lufttemperatur/kelheim/obersteinbach-200055/messwerte

The data is then prepared for serialization to the display

## Installation

### Access the raspberry

These instructions are for a raspberrypi b+

ssh into raspberry 

### Install

```python

sudo apt update

sudo apt install nodejs

git clone https://github.com/DL1CB/RamsbergWetterAnzeige.git

cd  RamsbergWetterAnzeige

npm install

npm test    #to see that it works

```

### Additional steps for production install

```python

sudo npm -g install pm2    # install the process manager, so your application can run as a daemon

pm2 startup                # when the raspberry boots it starts the process manager and thus this application
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi

npm start                  # add the app as a daemon to the process manager

pm2 save                   # save the running processes, that when the system reboots, they are re-initialized

sudo reboot                # reboot the raspberry pi and login

pm2 list                   # see that the app is in the list of processes 

```

... youre done!

Chris Bently
DL1CB@DARC.de
+491737072569