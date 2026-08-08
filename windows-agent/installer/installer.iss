[Setup]
AppName=AEGISX Windows Agent
AppVersion=1.0.0
Publisher=AEGISX Security
DefaultDirName={pf}\AEGISX-Agent
DefaultGroupName=AEGISX
UninstallDisplayIcon={app}\windows-agent.exe
Compression=lzma2
SolidCompression=yes
OutputDir=.\
OutputBaseFilename=AEGISX_Windows_Agent_Setup
ArchitecturesInstallIn64BitMode=x64

[Dirs]
Name: "{app}\logs"
Name: "{app}\config"

[Files]
; The packaged Spring Boot JAR
Source: "..\target\windows-agent-1.0.0.jar"; DestDir: "{app}"; Flags: ignoreversion
; WinSW executable renamed to match the service XML
Source: "winsw.exe"; DestName: "windows-agent.exe"; DestDir: "{app}"; Flags: ignoreversion
; WinSW configuration XML
Source: "windows-agent.xml"; DestDir: "{app}"; Flags: ignoreversion

[Run]
; Install the service
Filename: "{app}\windows-agent.exe"; Parameters: "install"; Flags: runhidden
; Start the service
Filename: "{app}\windows-agent.exe"; Parameters: "start"; Flags: runhidden

[UninstallRun]
; Stop the service before uninstalling
Filename: "{app}\windows-agent.exe"; Parameters: "stop"; Flags: runhidden
; Uninstall the service
Filename: "{app}\windows-agent.exe"; Parameters: "uninstall"; Flags: runhidden

[Code]
// Ensures Java is installed on the target machine
function InitializeSetup(): Boolean;
var
  ErrorCode: Integer;
begin
  Result := True;
  if not RegKeyExists(HKLM, 'SOFTWARE\JavaSoft\Java Runtime Environment') and 
     not RegKeyExists(HKLM, 'SOFTWARE\JavaSoft\JDK') then
  begin
    MsgBox('Java is required to install the AEGISX Windows Agent. Please install Java 21 or higher.', mbError, MB_OK);
  end;
end;
