// netlify/functions/archives.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://pgcmvrobdijtiajrykgm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnY212cm9iZGlqdGlhanJ5a2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjIzMjAsImV4cCI6MjA2Mjc5ODMyMH0.A9YDd5jfXkwgFYDrYn5WeNFiK49K6rdsQrVvW8TV4Ww'
);

exports.handler = async (event) => {
    const { httpMethod, path, body, queryStringParameters } = event;

    if (httpMethod === 'GET') {
        if (path.includes('/api/records')) {
            const { data, error } = await supabase
                .from('archives')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                return { statusCode: 500, body: JSON.stringify({ message: '데이터 로딩 실패' }) };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(data)
            };
        }

        if (path.includes('/api/record/')) {
            const id = path.split('/').pop();
            const { data, error } = await supabase
                .from('archives')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                return { statusCode: 404, body: JSON.stringify({ message: 'Record not found' }) };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(data)
            };
        }
    }

    if (httpMethod === 'POST') {
        const newRecord = JSON.parse(body);

        const { data, error } = await supabase
            .from('archives')
            .insert([newRecord]);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ message: '데이터 생성 실패' }) };
        }

        return {
            statusCode: 201,
            body: JSON.stringify(data)
        };
    }

    if (httpMethod === 'PUT') {
        const id = path.split('/').pop();
        const updatedRecord = JSON.parse(body);

        const { data, error } = await supabase
            .from('archives')
            .update(updatedRecord)
            .eq('id', id);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ message: '업데이트 실패' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    }

    if (httpMethod === 'DELETE') {
        const id = path.split('/').pop();

        const { error } = await supabase
            .from('archives')
            .delete()
            .eq('id', id);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ message: '삭제 실패' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Record deleted successfully' })
        };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
};