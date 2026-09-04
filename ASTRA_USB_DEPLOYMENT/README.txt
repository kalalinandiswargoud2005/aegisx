================================================================================
                    ASTRA EDR — USB DEPLOYMENT PACKAGE
================================================================================

This folder contains everything needed to deploy ASTRA EDR on any Windows target laptop.

--------------------------------------------------------------------------------
HOW TO USE WITH A USB PEN DRIVE:
--------------------------------------------------------------------------------

STEP 1: COPY TO USB
   - Insert your USB Pen Drive into your main laptop.
   - Copy the entire "ASTRA_USB_DEPLOYMENT" folder (or all files inside it) 
     onto your USB drive.

STEP 2: PLUG INTO TARGET LAPTOP
   - Take the USB drive to any target Windows laptop.
   - Plug the USB drive in.

STEP 3: INSTALL (1-CLICK)
   - Open the USB drive.
   - RIGHT-CLICK on "INSTALL_ASTRA.bat" and choose "Run as administrator".
   - Enter your SOC Server IP (e.g. http://192.168.1.50:8080) if prompted, 
     or press Enter for localhost.
   - That's it! 

--------------------------------------------------------------------------------
AUTOMATIC BEHAVIOR ON TARGET LAPTOP:
--------------------------------------------------------------------------------
1. The agent installs into C:\Astra\Agent\.
2. Automatically registers with your ASTRA Control Room.
3. Automatically starts on every Windows boot and reboot.
4. Automatically launches the Desktop Visual HUD upon user login.
5. Zero manual commands or terminal windows needed!
6. You can safely unplug the USB drive immediately after installation.

--------------------------------------------------------------------------------
FILES IN THIS USB FOLDER:
--------------------------------------------------------------------------------
1. INSTALL_ASTRA.bat    -> 1-Click Administrator Setup
2. UNINSTALL_ASTRA.bat  -> 1-Click Clean Removal
3. windows-agent.jar    -> Standalone ASTRA EDR Engine (Compiled Binary)
4. Astra-UI.vbs         -> Silent Desktop UI HUD Launcher
5. README.txt           -> This quick instruction guide
================================================================================
