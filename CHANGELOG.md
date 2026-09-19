# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-19

### Added

#### User Interface & Experience
- **macOS Glassmorphic Design**: Native titlebar integration with `under-window` vibrancy and custom traffic light inset positioning.
- **Cross-Platform Window Controls**: Dedicated titlebar overlay support for Windows with single-instance lock and CLI parameter handling.
- **Immersive Player Controls**: Auto-hiding control bar overlay with smooth transitions, progress scrubber, and timestamp display.
- **Bilingual & RTL Layout**: Complete English (`en`) and Arabic (`ar`) localization with full Right-to-Left (RTL) interface mirroring.
- **Theme Support**: Integrated dark, light, and system theme options.

#### Media Playback
- **Wide Format Support**: Hardware-accelerated playback for MP4, MOV, MKV, WebM, AVI, and M4V video containers.
- **Playback Controls**: Variable playback speed (0.25x to 2.0x), volume adjustment with mute/unmute toggle, and 10-second seek forward/backward.
- **Display Modes**: Native Fullscreen and Picture-in-Picture (PiP) modes.
- **Resume Playback**: Automatically persists and restores playback position for recently opened files.
- **Recent Files Menu**: Fast access to previously played media with one-click clear option.

#### Subtitle Engine
- **Parser Support**: Native parsing and rendering for SubRip (`.srt`) and WebVTT (`.vtt`) subtitle files.
- **Local Subtitle Auto-Detection**: Automatically searches for and mounts adjacent subtitle files sharing the video filename or language tags.
- **Live Timing & Delay Sync**: Real-time subtitle timing adjustment via shortcut keys (`[` and `]`) with on-screen HUD synchronization toast notifications.
- **Appearance Customization**: Configurable subtitle font family, size, weight, text color, outline width, background opacity, and bottom offset.
- **Online Subtitle Search**: Integrated OpenSubtitles search and direct download modal with automated query extraction (title, year, season, episode).

#### Media Inspector
- **Technical Media Information**: Dialog displaying container format, resolution, video/audio codecs, framerate, file size, and embedded track count.

#### Keyboard Shortcuts
- `Space`: Toggle Play / Pause
- `Left` / `Right` Arrow: Seek backward / forward 10 seconds
- `Up` / `Down` Arrow: Volume up / down
- `[` / `]`: Adjust subtitle delay (-250ms / +250ms)
- `F`: Toggle Fullscreen
- `M`: Toggle Mute / Unmute
