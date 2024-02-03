;; Example AutoHotkey v1 / 2 integration using WshShell - https://learn.microsoft.com/en-us/previous-versions//aew9yb99(v=vs.85)

Shell := ComObject("WScript.Shell")
Exec := Shell.Exec(A_ComSpec " /Q /K echo off")
Exec.StdIn.WriteLine("node ..\dist\index.js -t 10s`nexit")

while Exec.Status == 0 {
  line := Exec.StdOut.Readline()

  ;; Send windows alert
  if (line and InStr(line, ":")) {
    Field := StrSplit(line, ":")
    TrayTip(Trim(Field[1]) " is " Trim(StrReplace(Field[2], "_", " ")), "Alert!")
  }
}
