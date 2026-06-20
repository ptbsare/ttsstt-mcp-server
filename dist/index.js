"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// 环境变量配置
const config = {
    // STT配置
    sttUrl: process.env.STT_URL || process.env.OPENAI_STT_URL || "",
    sttApiKey: process.env.STT_API_KEY || process.env.OPENAI_STT_API_KEY || "",
    sttModel: process.env.STT_MODEL || process.env.OPENAI_STT_MODEL || "whisper-1",
    sttResponseFormat: process.env.STT_RESPONSE_FORMAT || process.env.OPENAI_STT_RESPONSE_FORMAT || "json",
    // TTS配置
    ttsUrl: process.env.TTS_URL || process.env.OPENAI_TTS_URL || "",
    ttsApiKey: process.env.TTS_API_KEY || process.env.OPENAI_TTS_API_KEY || "",
    ttsModel: process.env.TTS_MODEL || process.env.OPENAI_TTS_MODEL || "tts-1",
    ttsVoice: process.env.TTS_VOICE || process.env.OPENAI_TTS_VOICE || "alloy",
    ttsSpeed: parseFloat(process.env.TTS_SPEED || process.env.OPENAI_TTS_SPEED || "1.0"),
    ttsPitch: parseFloat(process.env.TTS_PITCH || process.env.OPENAI_TTS_PITCH || "1.0"),
    // TTS输出目录
    ttsOutputDir: process.env.TTS_OUTPUT_DIR || path.join(process.cwd(), "tts_output"),
};
// 确保TTS输出目录存在
if (!fs.existsSync(config.ttsOutputDir)) {
    fs.mkdirSync(config.ttsOutputDir, { recursive: true });
}
// 创建MCP服务器
const server = new mcp_js_1.McpServer({
    name: "ttsstt-mcp-server",
    version: "1.0.0",
});
// STT工具 - 语音转文字
server.tool("stt", "Convert speech (audio file) to text using STT API. Pass the audio file path to get transcribed text.", {
    audio_path: zod_1.z.string().describe("Path to the audio file to transcribe"),
    language: zod_1.z.string().optional().describe("Language code for transcription (e.g., 'en', 'zh', 'ja')"),
}, async ({ audio_path, language }) => {
    // 验证音频文件路径
    if (!fs.existsSync(audio_path)) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: Audio file not found at path: ${audio_path}`,
                },
            ],
            isError: true,
        };
    }
    // 检查STT URL是否配置
    if (!config.sttUrl) {
        return {
            content: [
                {
                    type: "text",
                    text: "Error: STT_URL environment variable is not set",
                },
            ],
            isError: true,
        };
    }
    try {
        // 读取音频文件
        const audioBuffer = fs.readFileSync(audio_path);
        // 构建multipart/form-data请求
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', audioBuffer, {
            filename: path.basename(audio_path),
            contentType: 'audio/mpeg'
        });
        formData.append('model', config.sttModel);
        formData.append('response_format', config.sttResponseFormat);
        if (language) {
            formData.append('language', language);
        }
        // 发送请求到STT API
        const response = await axios_1.default.post(config.sttUrl, formData, {
            headers: {
                Authorization: `Bearer ${config.sttApiKey}`,
                ...formData.getHeaders(),
            },
        });
        // 处理响应 - 可能是文本或JSON
        let transcribedText = "";
        if (typeof response.data === 'string') {
            transcribedText = response.data;
        }
        else if (response.data && response.data.text) {
            transcribedText = response.data.text;
        }
        else if (response.data && response.data.content) {
            transcribedText = response.data.content;
        }
        return {
            content: [
                {
                    type: "text",
                    text: transcribedText || "No text transcribed",
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        return {
            content: [
                {
                    type: "text",
                    text: `Error during STT: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// TTS工具 - 文字转语音
server.tool("tts", "Convert text to speech (audio file) using TTS API. Pass the text content to get the generated audio file path.", {
    text: zod_1.z.string().describe("Text content to convert to speech"),
    voice: zod_1.z.string().optional().describe("Voice to use (e.g., 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')"),
    speed: zod_1.z.number().optional().describe("Speech speed (0.25 to 4.0)"),
    pitch: zod_1.z.number().optional().describe("Pitch adjustment"),
}, async ({ text, voice, speed, pitch }) => {
    // 检查TTS URL是否配置
    if (!config.ttsUrl) {
        return {
            content: [
                {
                    type: "text",
                    text: "Error: TTS_URL environment variable is not set",
                },
            ],
            isError: true,
        };
    }
    try {
        // 构建请求
        const requestBody = {
            model: config.ttsModel,
            input: text,
            voice: voice || config.ttsVoice,
            speed: speed || config.ttsSpeed,
            response_format: "mp3",
        };
        // 发送请求到TTS API
        const response = await axios_1.default.post(config.ttsUrl, requestBody, {
            headers: {
                Authorization: `Bearer ${config.ttsApiKey}`,
                "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
        });
        // 生成唯一文件名
        const textHash = crypto.createHash("md5").update(text).digest("hex").substring(0, 8);
        const timestamp = Date.now();
        const filename = `tts_${timestamp}_${textHash}.mp3`;
        const outputPath = path.join(config.ttsOutputDir, filename);
        // 保存音频文件
        fs.writeFileSync(outputPath, Buffer.from(response.data));
        return {
            content: [
                {
                    type: "text",
                    text: outputPath,
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        return {
            content: [
                {
                    type: "text",
                    text: `Error during TTS: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// 启动服务器
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("TTSSTT MCP Server running on stdio");
}
main().catch(console.error);
//# sourceMappingURL=index.js.map