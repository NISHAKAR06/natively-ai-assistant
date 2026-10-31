Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd /c """ & ScriptDir & "\start-natively.bat""", 0, False
Set WshShell = Nothing
Set FSO = Nothing

