#VisPrinter

This is a highly modified fork of dronus' web front end for Printrun. Most of the framework was undertaken by dronus, with development here focusing on adding functionality and a GUI that works on a 800x480px touch screen.

![onpengpod](http://img39.imageshack.us/img39/8515/05printing.jpg)


![controls](http://img59.imageshack.us/img59/9757/02controls.jpg)

##Alterations/Changes/Improvements

-Removal of slicing interface/stl rendering

-Addition of three tabs for controls, 3D g-code preview and console.

-Realtime temperature and position feedback to similate that seen on LCD screens like Panelolu, Makerbot, etc.

-Manual connect, disconnect and reset for greater control.

-Removed bugs with print/pause/resume/cancel buttons so they show/hide at the correct times.

-Added browser controls to assist with keyboardless touch devices.

-Added touch friendly controls for extruder/bed temp, extrusion/retraction, homing and manual printer movements.

-Cleaned up console output to remove unimportant informaton.

-Added clear button for console.

-Modified webGL g-code preview for better 'camera' positioning and faster rendering. This is still limited to 64K vertices so large files will not render past a certain point.

-Added popup option to render or cancel 3D g-code render, improvingperformance on low power devices.

-Added automatic retrieval of last g-code sent to webserver on page refresh.

-Refined print progress bar to include numeric percentage, time elapsed and estimated time remaining. This persists even with a page refresh.

-Added heater kill on print cancel.

-Added linux bash script to start python server and open chromium to correct page.

-Added detection of .js and .css requests to serve correct MIME type. This previously broke styling on IE.

-Removed the need to have /index.html in broweser address.

-Added detection of webGL, disabling 3D g-code preview for affected users. Hence, older browsers can still control the printer.

##Intended Usage

The specific application in mind was the control of a Solidoodle 2 printer wit a Pengpod700. The pengpod runs the Printrun webserver and has a samba share where g-code can be dropped from other computers on the network. The prints can then be started/monitored on the Pengpod. Other computers on the network can still connect and control the printer.

##Requirements

-Modern browser capable of HTML5. WebGL compatibility required for 3D g-code previews.

-Device with python installed and capable of connecting to a reprap style printer via USB.

##Credits

-Based on Printrun - https://github.com/kliment/Printrun

-Uses lightgl.js - https://github.com/evanw/lightgl.js

-Forked from VisPrinter - https://github.com/dronus/VisPrinter

-Inspired by fsantini's pengpod printrun - https://github.com/fsantini/Printrun-pengpod700

-Further help from fsantini in setting up the pengpod and samba share.

##Installation and startup (short)

Step 1. Unzip files into a location of your choice.

Step 2. Run webserver.py

Step 3. Direct a browser window to http://127.0.0.1:8082/ on that device, or http://<ip address of device>:8082/ from a different device.

##Installation and setup (specific and detailed for Pengpod 700)

###Step 1. Install python.

Open a terminal window and enter:

```sudo apt-get install python-serial python-wxgtk2.8 python-pyglet```

This will install python automatically.

###Step 2. Install samba.

In a terminal window, enter:

```sudo apt-get install samba```

This will install samba automatically.

###Step 3. Setup a samba share for g-code (with thanks to fsantini).

In a terminal window, enter:

```
mkdir /home/linaro/gcode
chmod a+rwx /home/linaro/gcode
```

This creates the directory and makes it readable and writable to all.

Now the folder must be setup. Open up the configuration file with:

```sudo nano /etc/samba/smb.conf```

If you want a nicer GUI text editor, apt-get install gedit and then open the file as follows:
`sudo gedit /etc/samba/smb.conf

The following should be placed at the end:

```
[gcode]
    path = /home/linaro/gcode
    guest ok = yes
    browseable = yes
    read only = no
```

Save and close the file.

Now restart samba in the terminal by entering:

```sudo service smbd restart```

On a windows machine, under network, 'LINARO-ALIP' or similar should appear with the gcode folder inside it.
STL files can be sliced and processed by a more powerful computer, and then the g-code moved into this folder to be opened and printed from the pengpod

###Step 4. Install this repo.

Using teminal, make a folder to store the contents of this repo:

```
sudo mkdir /home/linaro/visp
chmod a+rwx /home/linaro/visp
```

Now unzip this repo into that folder.
If you want a nice GUI zip tool, apt-get install p7zip-full and then file-roller.
You will need to make some of the files writable/executable in the terminal:

```
sudo chmod a+rwx /home/linaro/visp/tmp
sudo chmod a+rwx /home/linaro/visp/webserver.py
sudo chmod a+rwx /home/linaro/visp/visp.sh
```

###Step 5. Make desktop shortcut.

Create a new shortcut on the desktop, entering VisPrinter (or whatever you like) in the first popup.
In the second popup screen, set the name as the same as previous.
Under command, enter:

```bash /home/linaro/visp/visp.sh```

Click ok.

###Step 6. Run the shell script.

Click of you new shortcut to run the shell script. Select 'execute' if a popup appears the first time.
The script will start the printer server webserver.py in a terminal window and then open chromium browser to 127.0.0.1:8082/index.html
If the terminal window is closed, the printer server will close also.
If you wish to run the webserver in the background, manually execute webserver.py by itself.
Once the webserver is running, other computers may access it through the browser. I set up the ip address of the penpod to always be the same with my router.
In my case, I can connect from my home network at http://192.168.1.11:8082/index.html where 192.168.1.11 is the ip address of the pengpod.

##Installation and setup (specific and detailed a Raspberry Pi running Arch Linux)

###Step 1. Image/Install Arch Linux ARM

Image an SD card with a copy of Arch Linux ARM from the Raspberry Pi website.

Instructions and downloads here:

http://www.raspberrypi.org/downloads

Boot the pi and login to the terminal with root/root username/password.

###Step 2. Update Pacman

Type:

```pacman -Suy```

###Step 2. Configure Wifi

An Edup wifi dongle is recommended for a Raspberry Pi because it requires very little power and can be run without a powered hub. Arch Linux and other distros also have built in support for its 8188CUS chipset.

I found netctl easy to use in setting up my connection (when it asks if netcfg should be deleted, do it):

```
pacman -S netctl
```

The following assumes you have a WPA wifi connection:

```
cp /etc/netctl/examples/wireless-wpa /etc/netctl
nano /etc/netctl/wireless-wpa
```

Change the description to something that you recognise.
Change the ESSID to your wifi SSID.
Change the key to your wifi password.
Save and exit.

Check your connection:

```
netctl start wireless-wpa
```

If it connects successfully, make it connect at boot:

```
netctl enable wireless-wpa
```

###Step 4. Make Visp directory

Make a directory:

```mkdir /home/visp```

Change permissions:

```chmod a+rwx /home/visp```

###Step 5. Install Dependencies

```pacman -S python2 python2-pyserial samba```

This will install dependencies. Note that you should run the webserver with python2, not python, for it to run correctly.

###Setp 6. Setup Samba

Make a copy of default configuration file:

```cp /etc/samba/smb.conf.default /etc/samba/smb.conf```

Now edit the configuration file:

```nano /etc/samba/smb.conf```

After ```security = user``` add:

```map to guest = Bad User```

This will configure the samba server to be accessed without logging in.

At the end of the file, add:

```
[visp]
    path = /home/visp
    guest ok = yes
    browseable = yes
    read only = no
```
It might also be a good idea to change the workgroup to ```WORKGROUP``` near the top of the file. 

Save the file and exit (control X then yes to save).

Make samba run at boot automatically:

```
systemctl enable smbd.service
systemctl enable nmbd.service
```

Reboot now and check if the samba server starts. Try accessing it from another machine, you should have access to the visp folder.

###Step 7. Install visp

At this point, I used the samba share on a windows machine to download the githubzip and unzip it into the visp folder.

To do it all from the linux command line:

```
cd /home/visp
pacman -S unzip
wget https://github.com/mlaws/VisPrinter/archive/master.zip
unzip master.zip
mv /home/visp/VisPrinter-master/* /home/visp
rm -r /home/visp/VisPrinter-master
```

Fix permissions for key files:
```
chmod a+rwx /home/visp/tmp
chmod a+rwx /home/visp/webserver.py
```

###Step 8. Test visp

To run the webserver:
```
python2 /home/visp/webserver.py
```
If this works, you can set it to run at boot. Make a service file:
```
nano /etc/systemd/system/webserver.service
```
Now enter:
```
[Unit]
Description=My script

[Service]
ExecStart=/usr/bin/my-script
Type=oneshot

[Install]
WantedBy=multi-user.target
```
and save changes.

Finally, enable the service at boot:
```
systemctl enable webserver.service
```


If you now power the pi from your printer's electronics (5V output), the pi will boot, connect to the network, and start the webserver when the printer is turned on. This takes approximately 15 seconds.

