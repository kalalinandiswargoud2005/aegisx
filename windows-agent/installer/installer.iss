[Setup]
AppName=ASTRA EDR Windows Agent
AppVersion=1.0.0
Publisher=ASTRA Security
DefaultDirName=C:\Astra\Agent
DefaultGroupName=ASTRA
UninstallDisplayIcon={app}\windows-agent.exe
Compression=lzma2
SolidCompression=yes
OutputDir=.\
OutputBaseFilename=ASTRA_Windows_Agent_Setup
ArchitecturesInstallIn64BitMode=x64

[Dirs]
Name: "C:\Astra\Agent"
Name: "C:\Astra\Agent\logs"
Name: "C:\Astra\Demo"
Name: "C:\ProgramData\Astra\Agent"
Name: "C:\ProgramData\Astra\Agent\logs"

[Files]
; Packaged Spring Boot JAR
Source: "..\target\windows-agent-1.0.0.jar"; DestName: "windows-agent.jar"; DestDir: "{app}"; Flags: ignoreversion
; WinSW executable renamed to match service
Source: "winsw.exe"; DestName: "windows-agent.exe"; DestDir: "{app}"; Flags: ignoreversion
; WinSW configuration XML
Source: "windows-agent.xml"; DestDir: "{app}"; Flags: ignoreversion
; Interactive User Session UI Companion Launcher
Source: "..\Astra-UI.vbs"; DestDir: "{app}"; Flags: ignoreversion

[Registry]
; Auto-start interactive UI Companion for logged-in users
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "ASTRA_EDR_UI_Companion"; ValueData: "wscript.exe ""{app}\Astra-UI.vbs"""; Flags: uninsdeletevalue

[Run]
; Install and start the background Windows Service
Filename: "{app}\windows-agent.exe"; Parameters: "install"; Flags: runhidden
Filename: "{app}\windows-agent.exe"; Parameters: "start"; Flags: runhidden
; Launch interactive UI Companion immediately for the current installer session
Filename: "wscript.exe"; Parameters: """{app}\Astra-UI.vbs"""; Flags: runhidden nowait

[UninstallRun]
; Stop and remove the service
Filename: "{app}\windows-agent.exe"; Parameters: "stop"; Flags: runhidden
Filename: "{app}\windows-agent.exe"; Parameters: "uninstall"; Flags: runhidden

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
