# Notice

tv-remote uses a bunch of existing projects and combines them in a way that makes mirroring and remote controlling an Android device in the browser easier than ever.

## androidmirrroing

The code for mirroring the h264 stream from scrcpy to the browser was adapted from [androidmirrroing](https://github.com/vuquangtrong/androidmirrroing). We updated the [ws-avc-player](https://github.com/matijagaspar/ws-avc-player) used to show the stream in the browser to a more recent version, which also uses a web worker.

```
Copyright (c) 2018 vuquangtrong

androidmirrroing is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

androidmirrroing is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with androidmirrroing. If not, see <http://www.gnu.org/licenses/>.
```

## scrcpy

For video streaming, we use [scrcpy](https://github.com/Genymobile/scrcpy), which provides display and control of Android devices via ADB without root access. Specifically, we use [version 1.5](https://github.com/Genymobile/scrcpy/releases/tag/v1.5-fixversion).

```
Copyright (C) 2018 Genymobile
Copyright (C) 2018-2021 Romain Vimont

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## ws-avc-player

The browser playback code is based on the [ws-avc-player](https://github.com/matijagaspar/ws-avc-player) example code, which in turn uses [Broadway.js](https://github.com/mbebenita/Broadway), a JavaScript H.264 decoder, to play the stream.

```
Copyright (c) 2016, Project Authors (see AUTHORS file)
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  *  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  *  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  *  Neither the names of the Project Authors nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
