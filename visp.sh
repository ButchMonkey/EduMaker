#!/bin/bash
killall -9 webserver.py
#chromium-browser --noerordialogs --disable-session-crashed-bubble --disable-infobars --kiosk "http://127.0.01:8082/index.html" &
chromium-browser "http://127.0.01:8082/index.html" &
lxterminal -e /home/linaro/visp/webserver.py
