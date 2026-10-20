# Version 1.1.5

Local Windows release prepared from the 1.1.4 recording and saving work.

## Recording and saving

- MP4 and MKV are the available recording formats. Existing AVI/WebM library files remain accessible.
- Recording is saved progressively during capture. FFmpeg copies the encoded video and handles audio/container output while recording; no additional full-video compression pass runs after Stop.
- Full source resolution remains the default. The lower-resource setting limits frame frequency rather than shrinking screen text. A 720p output setting has not been added in this release.
- Timed recording uses the selected duration, with encoded video timestamps determining when enough media has arrived. Video/audio beyond the endpoint are trimmed independently. Small endpoint differences are finalized without another video encode; larger discrepancies are reported.
- Automatic continuation recreates the canvas consumer and resumes the audio graph on the selected source after the previous encoder stops, before saving the preceding segment.
- MP4 duration metadata and MKV duration/seek indexes are finalized at Stop. Successful saves remove their temporary recovery files. Incomplete or failed saves preserve recovery input.
- The bottom HH:MM:SS display, resettable next file number, window/rectangle/screen capture, webcam overlay, and microphone/system audio controls remain.

## Limits

Saved duration and wall-clock elapsed time are different measurements: capture startup and buffering can delay the Stop event. A zero-gap handoff is not guaranteed. Video compression is not mathematically lossless, and file size varies with captured content; there is no fixed 120–150 MB guarantee.

Both source recovery input and output are written while recording, so temporary disk requirements can approach twice the output size. Physical device, screen-lock, sleep and low-end-PC behavior still require hardware-specific checks.

See VERIFICATION_1.1.5.md for the exact checks and release status. No installer is automatically installed or published.
