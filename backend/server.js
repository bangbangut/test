// .env 파일에서 환경 변수를 로드합니다.
require('dotenv').config();

const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
// 호스팅 환경(Vercel 등)에서 제공하는 포트를 사용하거나, 로컬에서는 3000번 포트를 사용합니다.
const port = process.env.PORT || 3000;

// Anthropic 클라이언트를 초기화합니다.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 프론트엔드에서 보낸 JSON 형식의 요청 본문을 파싱하기 위한 미들웨어입니다.
app.use(express.json());

// 정적 파일(HTML, CSS, JS)을 제공하기 위한 미들웨어입니다.
// path.join을 사용하여 현재 파일 위치 기준으로 상대 경로를 안전하게 설정합니다.
// '..'는 상위 폴더를 의미하므로, 'backend' 폴더에서 나와 'frontend' 폴더를 가리킵니다.
app.use(express.static(path.join(__dirname, '../frontend')));

// API 엔드포인트: POST /api/generate
app.post('/api/generate', async (req, res) => {
  try {
    // 요청 본문에서 'topic'을 추출합니다.
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: '주제를 입력해주세요.' });
    }

    // 클로드 API를 호출합니다.
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", // 또는 claude-3-haiku-20240307 등
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `"${topic}"라는 주제로 매우 창의적이고 감성적인 한 줄 문장을 만들어줘.`
        }
      ],
    });

    // 성공 시 생성된 문장을 JSON 형태로 응답합니다.
    res.json({ sentence: msg.content[0].text });

  } catch (error) {
    console.error('클로드 API 호출 중 오류 발생:', error);
    // 실패 시 에러 메시지를 응답합니다.
    res.status(500).json({ error: '문장 생성에 실패했습니다.' });
  }
});

// 서버를 시작하고, 지정된 포트에서 요청을 기다립니다.
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});