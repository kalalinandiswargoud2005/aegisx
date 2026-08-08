[Setup]
AppName=AEGISX Endpoint Agent
AppVersion=1.0.0
DefaultDirName={pf}\AEGISX-Agent
DefaultGroupName=AEGISX
UninstallDisplayIcon={app}\aegisx-agent.exe
Compression=lzma2
SolidCompression=yes
OutputDir=userdocs:Inno Setup Examples Output
OutputBaseFilename=AEGISX-Agent-Setup

[Files]
Source: "target\aegisx-agent-1.0.0.jar"; DestDir: "{app}"; Flags: ignoreversion
Source: "aegisx-agent.xml"; DestDir: "{app}"; Flags: ignoreversion
; Assuming the WinSW exe is renamed to aegisx-agent.exe and placed here before compiling
Source: "winsw.exe"; DestName: "aegisx-agent.exe"; DestDir: "{app}"; Flags: ignoreversion

[Run]
Filename: "{app}\aegisx-agent.exe"; Parameters: "install"; Flags: runhidden
Filename: "{app}\aegisx-agent.exe"; Parameters: "start"; Flags: runhidden

[UninstallRun]
Filename: "{app}\aegisx-agent.exe"; Parameters: "stop"; Flags: runhidden
Filename: "{app}\aegisx-agent.exe"; Parameters: "uninstall"; Flags: runhidden
