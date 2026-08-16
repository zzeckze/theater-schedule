exports.handler = async function (event) {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const code = params.get("code");

    if (!code) {
      return {
        statusCode: 400,
        body: "카카오 로그인 인증 코드가 없습니다."
      };
    }

    const redirectUri =
      "https://theater-schedule.netlify.app/.netlify/functions/kakao-callback";

    const tokenResponse = await fetch(
      "https://kauth.kakao.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_REST_API_KEY,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
          redirect_uri: redirectUri,
          code: code
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
  return {
    statusCode: 500,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      message: "카카오 토큰 발급 실패",
      kakao: tokenData
    })
  };
}

    const userResponse = await fetch(
      "https://kapi.kakao.com/v2/user/me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      return {
        statusCode: 500,
        body: "카카오 사용자 정보를 가져오지 못했습니다."
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: "/?kakao_login=success"
      },
      body: ""
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "카카오 로그인 처리 중 오류가 발생했습니다."
    };
  }
};
