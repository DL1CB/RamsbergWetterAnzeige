
# Ramsberg Wetter Anzeige

## about

These instructions are for a raspberrypi b+

## access the raspberry

install putty

ssh into raspberry

user: pi
password: (default is raspberry .... change it)


## install

sudo apt update

sudo apt install nodejs

git clone https://github.com/DL1CB/RamsbergWetterAnzeige.git

cd  RamsbergWetterAnzeige

npm install

npm test    #to see that it works


## Additional steps for production install

sudo npm -g install pm2    # install the process manager, so your application can run as a daemon

sudo pm2 startup           # when the raspberry boots it starts the process manager and thus this application

npm start                  # add the app as a daemon to the process manager

pm2 save                   # save the running processes, that when the system reboots, they are re-initialized

sudo reboot                # reboot the raspberry pi and login

pm2 list                   # see that the app is in the list of processes 

# issues

if the app is not in the process list after running pm2 list


