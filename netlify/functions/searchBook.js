const fetch = require('node-fetch');

exports.handler = async (event) => {
  const query = event.queryStringParameters.query;

  try {
    const response = await fetch(`https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(query)}`, {
      headers: {
        'X-Naver-Client-Id': '47j5zNwFMwTzdRe6R9YC',
        'X-Naver-Client-Secret': '6wJ2VdP7qg'
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    console.error(error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'API 요청 실패' }),
    };
  }
};