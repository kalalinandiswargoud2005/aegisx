[Setup]
AppName=ASTRA Endpoint Agent
AppVersion=1.0.0
DefaultDirName={pf}\ASTRA-Agent
DefaultGroupName=ASTRA
UninstallDisplayIcon={app}\astra-agent.exe
Compression=lzma2
SolidCompression=yes
OutputDir=userdocs:Inno Setup Examples Output
OutputBaseFilename=ASTRA-Agent-Setup

[Files]
Source: "target\astra-agent-1.0.0.jar"; DestDir: "{app}"; Flags: ignoreversion
Source: "astra-agent.xml"; DestDir: "{app}"; Flags: ignoreversion
; Assuming the WinSW exe is renamed to astra-agent.exe and placed here before compiling
Source: "winsw.exe"; DestName: "astra-agent.exe"; DestDir: "{app}"; Flags: ignoreversion

[Run]
Filename: "{app}\astra-agent.exe"; Parameters: "install"; Flags: runhidden
Filename: "{app}\astra-agent.exe"; Parameters: "start"; Flags: runhidden

[UninstallRun]
Filename: "{app}\astra-agent.exe"; Parameters: "stop"; Flags: runhidden
Filename: "{app}\astra-agent.exe"; Parameters: "uninstall"; Flags: runhidden
