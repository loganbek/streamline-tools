REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.piercewashington.app_launcher" /ve /t REG_SZ /d "%~dp0host_conf.json" /f
mkdir "%HOMEDRIVE%%HOMEPATH%"\.bigtools
