' ASTRA EDR - Silent User Session UI Companion Launcher
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strInstallDir = "C:\Astra\Agent"
strJarPath = strInstallDir & "\windows-agent.jar"
strJavaPathFile = strInstallDir & "\java-path.txt"

' Locate Java binary
strJavaBin = "javaw.exe"

' 1. Check if installer saved the detected Java path
If fso.FileExists(strJavaPathFile) Then
    Set objFile = fso.OpenTextFile(strJavaPathFile, 1)
    strLine = Trim(objFile.ReadLine)
    objFile.Close
    If fso.FileExists(strLine) Then
        strJavaBin = """" & strLine & """"
    End If
End If

' 2. Fallback to JAVA_HOME
If strJavaBin = "javaw.exe" And WshShell.Environment("PROCESS")("JAVA_HOME") <> "" Then
    If fso.FileExists(WshShell.Environment("PROCESS")("JAVA_HOME") & "\bin\javaw.exe") Then
        strJavaBin = """" & WshShell.Environment("PROCESS")("JAVA_HOME") & "\bin\javaw.exe"""
    End If
End If

strCmd = strJavaBin & " -Djava.awt.headless=false -jar """ & strJarPath & """ --astra.companion=true"
WshShell.Run strCmd, 0, False

