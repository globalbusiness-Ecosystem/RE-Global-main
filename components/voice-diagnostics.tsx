'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import voiceService from '@/lib/voice-service';
import { Button } from '@/components/ui/button';

export default function VoiceDiagnostics() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const info = voiceService.getDeviceInfo();
    setDeviceInfo(info);
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = { passed: 0, failed: 0, warnings: [] };

    // Test 1: Speech Synthesis
    const synth = window.speechSynthesis;
    if (synth) {
      results.speechSynthesis = true;
      results.passed++;
      
      const voices = synth.getVoices();
      const hasArabic = voices.some(v => v.lang.startsWith('ar'));
      const hasEnglish = voices.some(v => v.lang.startsWith('en'));
      
      if (!hasArabic) results.warnings.push('❌ No Arabic voices found');
      if (!hasEnglish) results.warnings.push('❌ No English voices found');
      if (hasArabic && hasEnglish) results.passed++;
    } else {
      results.speechSynthesis = false;
      results.failed++;
      results.warnings.push('❌ Speech Synthesis not supported');
    }

    // Test 2: Speech Recognition
    const RecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (RecognitionClass) {
      results.speechRecognition = true;
      results.passed++;
    } else {
      results.speechRecognition = false;
      results.failed++;
      results.warnings.push('❌ Speech Recognition not supported');
    }

    // Test 3: Microphone Access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      results.microphone = true;
      results.passed++;
    } catch (error) {
      results.microphone = false;
      results.failed++;
      results.warnings.push('❌ Microphone not available or permission denied');
    }

    // Test 4: Test actual speech synthesis
    try {
      const testUtterance = new SpeechSynthesisUtterance('test');
      results.testSpeech = !synth?.speaking;
      if (results.testSpeech) results.passed++;
    } catch {
      results.testSpeech = false;
      results.failed++;
      results.warnings.push('❌ Speech synthesis test failed');
    }

    setTestResults(results);
    setIsRunning(false);
  };

  if (!deviceInfo) return <div className="text-center text-gray-400">Loading...</div>;

  return (
    <div className="w-full max-w-md bg-slate-800 rounded-lg p-6 border border-gold/20 space-y-4">
      <h3 className="text-lg font-bold text-gold">Voice Diagnostics</h3>

      {/* Device Info */}
      <div className="space-y-2 text-sm">
        <p className="text-gray-300">
          <span className="text-gold">Platform:</span> {deviceInfo.isAndroid ? 'Android' : deviceInfo.isIOS ? 'iOS' : 'Desktop'}
        </p>
        <p className="text-gray-300">
          <span className="text-gold">Speech Synthesis:</span> {deviceInfo.speechSynthesisSupported ? '✅' : '❌'}
        </p>
        <p className="text-gray-300">
          <span className="text-gold">Speech Recognition:</span> {deviceInfo.speechRecognitionSupported ? '✅' : '❌'}
        </p>
      </div>

      <Button
        onClick={runDiagnostics}
        disabled={isRunning}
        className="w-full bg-gold/20 text-gold hover:bg-gold/30"
      >
        {isRunning ? (
          <>
            <Loader size={16} className="animate-spin mr-2" />
            Testing...
          </>
        ) : (
          'Run Full Test'
        )}
      </Button>

      {testResults && (
        <div className="space-y-3 bg-slate-700/50 p-4 rounded">
          <div className="flex justify-between text-sm">
            <span className="text-green-400">✅ Passed: {testResults.passed}</span>
            <span className="text-red-400">❌ Failed: {testResults.failed}</span>
          </div>
          {testResults.warnings.length > 0 && (
            <div className="space-y-1">
              {testResults.warnings.map((warning: string, i: number) => (
                <p key={i} className="text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle size={12} />
                  {warning}
                </p>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-slate-600 text-xs text-gray-400">
            {testResults.failed === 0 ? (
              <p className="text-green-400">✅ All voice features working!</p>
            ) : (
              <p>⚠️ Some features need attention. Check browser settings and permissions.</p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 space-y-2 bg-slate-700/30 p-3 rounded">
        <p className="font-semibold text-gold">Troubleshooting tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Enable system volume and check speaker settings</li>
          <li>Grant microphone permission in browser settings</li>
          <li>Ensure HTTPS connection (required for microphone)</li>
          <li>Try a different browser (Chrome/Firefox work best)</li>
          <li>Check if another app is using the microphone</li>
          <li>Restart the browser and try again</li>
        </ul>
      </div>
    </div>
  );
}
