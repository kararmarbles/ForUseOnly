# Version 1.1.5 verification

20 October 2026. Local installer ready for manual verification. Recording checks below passed; the requested 100–120 MB maximum for 30 minutes is NOT achieved by this profile.

## Final build

- TypeScript check, production renderer build and local installer packaging passed.
- Packaged source comparison passed: all Electron sources and production renderer output match the current workspace. Evidence: `release/1.1.5/source-verification.json`.
- Installer SHA-256: `95A18FAB5742E3FF7ACB962197C7E7D715EFB666C62B858A607FF578076FAE12`.
- No automatic installation, Git push/pull or publication was performed.

## Real 30-minute recording and continuation

Evidence folder: `release/security-verification/app-audio-mp4-1792512459540`.

- The actual elapsed-time recording saved movie/video duration **1800.000 seconds** at 1920x1080. The final second decoded 15 video frames.
- Full audio decoding produced 1800.021375 seconds (codec priming included). All 1800 full-second audio buckets contained signal. Generated microphone/system tones remained at 440/660 Hz. Visible source-clock elapsed differed from the expected interval by 15 ms.
- The next recorder start request followed Stop by **238 ms**. Start-to-start interval was 1800479.5 ms. This is not a zero-gap guarantee.
- The successor saved 12.558375 seconds, with 184 decoded video frames, the generated source color patch present, and 12.565375 seconds of audible generated audio.
- Manual Stop-to-ready observation for the successor was 1041 ms, including one-second polling. This does not establish the exact finalization latency of the first 30-minute file.
- `long-media-inspection.json` and `continuation-media-inspection.json` record the independent media/event checks.
- The original UI harness exited at its strict stay-minimized assertion after nine window restores, with zero application restore IPC requests. The user subsequently confirmed manually restoring the window. The original failure log remains intact; it is not relabeled as an uninterrupted all-assertions pass. Independent saved-media and continuation checks passed, and the manual-interaction explanation resolves this run's minimization concern.

## Other current-version checks

| Check | Result / evidence |
|---|---|
| Pause/resume and simulated one-hour clock change | Exact 9.000-second MP4 with audio; `release/security-verification/app-audio-mp4-1792512364541/result.json` |
| Selected-window capture in low-resource mode | Exact 7.000-second MKV plus successor, selected 804x456 source retained and source pixels checked; `release/security-verification/app-video-mkv-1792512418029/result.json` |
| Close during saving | Save completed before closure with sleep blocker active; `release/security-verification/close-guard-1792512439838/result.json` |
| Packaged MP4 | Passed two exact 12-second segments plus partial, generated audio, webcam overlay, full-resolution preview, final-second decoding and recovery cleanup; `release/1.1.5/packaged-verification/1792514343402/result.json` |
| Packaged MKV | Passed two exact 12-second segments plus partial, generated audio, cues/seek checks, final-second decoding and recovery cleanup; `release/1.1.5/packaged-verification/1792514404218/result.json` |

## File size and quality

The 30-minute sample is 181,918,498 bytes: **181.9 decimal MB / 173.5 MiB**. It exceeds the user's requested 100–120 MB limit. MP4/MKV container choice alone does not guarantee this limit. The profile preserves source resolution and uses the established 3 Mbps requested video / 128 kbps audio settings; actual encoded video bitrate depends on content and encoder behavior. It does not run a second full-video compression pass after Stop. A 720p mode has not been added or enabled in this release. Reducing resolution or bitrate can affect screen-text clarity; no lossless-quality or universal size guarantee is made.

## Hardware and timing limits

Generated screen/audio checks validate timing, media contents and mixing, not physical microphone/webcam quality or every low-end PC. Hardware fallback encoding, device disconnection, screen lock, sleep and power-loss behavior still need hardware-specific testing. Saved duration is the selected media duration; source startup/buffering can extend wall elapsed time. Both raw recovery input and muxed output exist during capture, so temporary storage can approach twice the output size.

User manual installation/playback approval remains pending before GitHub publication.
