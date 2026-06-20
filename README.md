# TTSSTT MCP Server

A Model Context Protocol (MCP) server that provides Speech-to-Text (STT) and Text-to-Speech (TTS) tools using OpenAI-compatible APIs.

## Features

- **STT (Speech-to-Text)**: Convert audio files to text using OpenAI-compatible STT APIs
- **TTS (Text-to-Speech)**: Convert text to audio files using OpenAI-compatible TTS APIs

## Quick Start

### Using npx (Recommended)

```bash
npx github:ptbsare/ttsstt-mcp-server
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/ptbsare/ttsstt-mcp-server.git
cd ttsstt-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Environment Variables

### STT Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `STT_URL` | OpenAI-compatible STT API endpoint URL | (required) |
| `STT_API_KEY` | API key for STT service | (required) |
| `STT_MODEL` | STT model name | `whisper-1` |
| `STT_RESPONSE_FORMAT` | Response format (`json`, `text`, `srt`, `verbose_json`, `vtt`) | `json` |

### TTS Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `TTS_URL` | OpenAI-compatible TTS API endpoint URL | (required) |
| `TTS_API_KEY` | API key for TTS service | (required) |
| `TTS_MODEL` | TTS model name (`tts-1`, `tts-1-hd`, `gpt-4o-mini-tts`) | `tts-1` |
| `TTS_VOICE` | Voice to use (`alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`) | `alloy` |
| `TTS_SPEED` | Speech speed (0.25 to 4.0) | `1.0` |
| `TTS_PITCH` | Pitch adjustment | `1.0` |
| `TTS_OUTPUT_DIR` | Directory to save generated audio files | `./tts_output` |

### Alternative Environment Variables

You can also use the following prefixed versions:
- `OPENAI_STT_URL`, `OPENAI_STT_API_KEY`, `OPENAI_STT_MODEL`, `OPENAI_STT_RESPONSE_FORMAT`
- `OPENAI_TTS_URL`, `OPENAI_TTS_API_KEY`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE`, `OPENAI_TTS_SPEED`, `OPENAI_TTS_PITCH`, `OPENAI_TTS_OUTPUT_DIR`

## Usage

### Configure MCP Client

Add to your MCP client configuration (e.g., Claude Desktop, Cursor, VS Code):

```json
{
  "mcpServers": {
    "ttsstt": {
      "command": "npx",
      "args": ["github:ptbsare/ttsstt-mcp-server"],
      "env": {
        "STT_URL": "http://192.168.195.210:10500/v1/audio/transcriptions",
        "STT_API_KEY": "your-stt-api-key",
        "STT_MODEL": "whisper-1",
        "TTS_URL": "http://192.168.195.210:10500/v1/audio/speech",
        "TTS_API_KEY": "your-tts-api-key",
        "TTS_MODEL": "tts-1",
        "TTS_VOICE": "alloy",
        "TTS_OUTPUT_DIR": "./audio_output"
      }
    }
  }
}
```

### STT Tool

Convert audio to text:

```json
{
  "tool": "stt",
  "arguments": {
    "audio_path": "/path/to/audio.mp3",
    "language": "zh"
  }
}
```

**Parameters:**
- `audio_path` (required): Path to the audio file to transcribe
- `language` (optional): Language code for transcription (e.g., 'en', 'zh', 'ja')

### TTS Tool

Convert text to audio:

```json
{
  "tool": "tts",
  "arguments": {
    "text": "Hello, world! This is a test.",
    "voice": "nova",
    "speed": 1.0
  }
}
```

**Parameters:**
- `text` (required): Text content to convert to speech
- `voice` (optional): Voice to use (alloy, echo, fable, onyx, nova, shimmer)
- `speed` (optional): Speech speed (0.25 to 4.0)
- `pitch` (optional): Pitch adjustment

**Returns:** Path to the generated audio file

## API Compatibility

This server is compatible with OpenAI's Audio API format:

- **STT**: Uses `/v1/audio/transcriptions` endpoint with multipart/form-data
- **TTS**: Uses `/v1/audio/speech` endpoint with JSON body

## Testing

Test server with the provided test endpoint:

```bash
STT_URL=http://192.168.195.210:10500/v1/audio/transcriptions \
STT_API_KEY=test \
TTS_URL=http://192.168.195.210:10500/v1/audio/speech \
TTS_API_KEY=test \
TTS_OUTPUT_DIR=/tmp/tts_output \
npm run build && npm start
```

## Project Structure

```
ttsstt-mcp-server/
├── src/
│   └── index.ts          # Main server code
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK
- `axios` - HTTP client
- `zod` - Schema validation
- `form-data` - Multipart form data for STT

## License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
