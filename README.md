```
  ______    _       __  __       _             
 |  ____|  | |     |  \/  |     | |            
 | |__   __| |_   _| \  / | __ _| | _____ _ __ 
 |  __| / _` | | | | |\/| |/ _` | |/ / _ \ '__|
 | |___| (_| | |_| | |  | | (_| |   <  __/ |   
 |______\__,_|\__,_|_|  |_|\__,_|_|\_\___|_|   
                                               
 ----------------------------------------------------------------- 
```
## Installation

### Step 1. Install python.

```
sudo apt-get install python-serial python-wxgtk2.8 python-pyglet
```

This will install python automatically.

### Step 2. Install this repo.

Using teminal, make a folder to store the contents of this repo:

```
sudo mkdir /path/to/folder
chmod a+rwx /path/to/folder
```
Clone this project to that folder

```
git clone git@github.com:ButchMonkey/EduMaker.git
(git clone https://ButchMonkey@github.com/ButchMonkey/EduMaker for private)
```

Give appropriate permissions

```
sudo chmod a+rwx /path/to/folder/EduMaker/tmp
sudo chmod a+rwx /path/to/folder/EduMakerwebserver.py
sudo chmod a+rwx /path/to/folder/EduMaker/run.sh
```

                                
### To Do List
* Change namespace to "printerface"
* Convert to angular to allow use of scope variables
  * Keep a back up of the old version to support non angular
* Edit python scripts to return meaningful data
* Add console for viewing data back from the printer ( and send log as email? )
* 
*
*