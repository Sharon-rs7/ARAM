Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("E:\prgt\My-aram-app\ai-service\real_spoken_salary.wav")
$synth.Speak("My salary was not paid this month.")
$synth.Dispose()
Write-Host "[SPOKEN WAV GENERATED SUCCESSFULLY]"
