#!/bin/bash
# =============================================================================
# ASTRA 7" Touchscreen Kiosk Boot Dispatcher
# Direct launch in big, touch-friendly UI scale (1.25x)
# =============================================================================

# 1. Screen settings (no sleep/blanking)
xset s noblank 2>/dev/null
xset s off 2>/dev/null
xset -dpms 2>/dev/null

# 2. Hide mouse cursor on touch
unclutter -idle 0.1 -root &

# 3. Clean up any previous browser crash balloons
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences 2>/dev/null
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences 2>/dev/null

# 4. Wait for network connection
sleep 5

# 5. Launch Fullscreen Chromium Kiosk with LARGE UI Scale (1.25x for 7" touchscreen)
chromium-browser \
  --kiosk \
  --start-fullscreen \
  --window-position=0,0 \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --check-for-update-interval=31536000 \
  --touch-events=enabled \
  --force-device-scale-factor=1.25 \
  --disable-pinch \
  --app="https://astra-rq4t.vercel.app/"
